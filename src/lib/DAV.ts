import joinPath, { trailingSlash } from './joinPath';
import Collection from './Collection';
import DAVResponse from './Response';
import Entry from './Entry';
import HTTP from './HTTP';
import RequestFailure from './HTTP/RequestFailure';
import { error } from 'melba-toast';
import { t } from 'i18next';

type ConstructorOptions = {
  bypassCheck?: boolean;
  sortDirectoriesFirst?: boolean;
};

type CachedRequests = {
  GET: string;
  PROPFIND: Collection;
};

export type RequestCache<
  K extends keyof CachedRequests = keyof CachedRequests,
  T extends CachedRequests[K] = CachedRequests[K]
> = Map<K, Map<string, T>>;

const emptyCache = (): RequestCache => {
  const cache = new Map<
    keyof CachedRequests,
    Map<string, Collection | string>
  >();

  cache.set('GET', new Map<string, string>());
  cache.set('PROPFIND', new Map<string, Collection>());

  return cache;
};

export class DAV {
  #bypassCheck: boolean;
  #cache: RequestCache;
  #http: HTTP;
  #sortDirectoriesFirst: boolean;

  #dropCache = <K extends keyof CachedRequests = keyof CachedRequests>(
    type: K,
    uri: string
  ): void | null => {
    const lookup = this.#cache.get(type);

    if (lookup.has(uri)) {
      lookup.delete(uri);
    }
  };
  #getCache = <K extends keyof CachedRequests = keyof CachedRequests>(
    type: K,
    uri: string
  ): CachedRequests[K] | null => {
    const lookup = this.#cache.get(type);

    if (!lookup.has(uri)) {
      return null;
    }

    return lookup.get(uri) as CachedRequests[K];
  };
  #hasCache = <K extends keyof CachedRequests = keyof CachedRequests>(
    type: K,
    uri: string
  ): boolean => {
    const lookup = this.#cache.get(type);

    return lookup.has(uri);
  };
  #setCache = <K extends keyof CachedRequests = keyof CachedRequests>(
    type: K,
    uri: string,
    value: CachedRequests[K]
  ): void | null => {
    const lookup = this.#cache.get(type);

    lookup.set(uri, value);
  };
  #toastOnFailure = async (
    func: () => Promise<Response>,
    quiet: boolean = false
  ): Promise<Response> => {
    try {
      return await func();
    } catch (e) {
      if (!(e instanceof RequestFailure)) {
        throw e;
      }

      if (!quiet) {
        error(
          t('failure', {
            interpolation: {
              escapeValue: false,
            },
            method: e.method(),
            url: e.url(),
            statusText: e.statusText(),
            status: e.status(),
          })
        );
      }

      return e.response();
    }
  };
  #validDestination = (destination: string): string => {
    const hostname = `${location.protocol}//${location.hostname}${
        location.port ? `:${location.port}` : ''
      }`,
      hostnameRegExp = new RegExp(`^${hostname}`);

    if (!destination.match(hostnameRegExp)) {
      if (destination.match(/^http/)) {
        throw new TypeError(`Invalid destination host: '${destination}'.`);
      }

      return `${hostname}${destination}`;
    }

    return destination;
  };

  constructor(
    { bypassCheck, sortDirectoriesFirst }: ConstructorOptions,
    cache: RequestCache = emptyCache(),
    http = new HTTP()
  ) {
    this.#bypassCheck = bypassCheck;
    this.#sortDirectoriesFirst = sortDirectoriesFirst;
    this.#cache = cache;
    this.#http = http;
  }

  /**
   * @param uri The URI to perform a HEAD request for
   * @param quiet Whether or not to invoke the error toast
   */
  async check(
    uri: string,
    quiet: boolean = false
  ): Promise<{
    ok: boolean;
    status: number;
  }> {
    if (this.#bypassCheck) {
      return Promise.resolve({
        ok: true,
        status: 200,
      });
    }

    return this.#toastOnFailure(
      (): Promise<Response> => this.#http.HEAD(uri),
      quiet
    );
  }

  /**
   * @param from The path to the file or directory to copy
   * @param to The path of the directory to copy to
   * @param entry The Entry for the file to copy
   * @param overwrite
   */
  async copy(
    from: string,
    to: string,
    entry: Entry,
    overwrite: boolean = false
  ): Promise<Response> {
    const headers: HeadersInit = {
      Destination: this.#validDestination(to),
      Overwrite: overwrite ? 'T' : 'F',
    };

    if (entry.directory) {
      headers['Depth'] = 'infinity';
    }

    return this.#toastOnFailure(
      (): Promise<Response> =>
        this.#http.COPY(from, {
          headers,
        })
    );
  }

  /**
   * @param fullPath The full path of the directory to create
   */
  async createDirectory(fullPath: string): Promise<Response> {
    return this.#toastOnFailure(
      (): Promise<Response> => this.#http.MKCOL(fullPath)
    );
  }

  /**
   * @param uri The URI of the item to delete
   */
  async del(uri: string): Promise<Response> {
    return this.#toastOnFailure(
      (): Promise<Response> =>
        this.#http.DELETE(uri, {
          headers: {
            Depth: 'infinity',
          },
        })
    );
  }

  /**
   * @param uri The URI of the item to get
   */
  async get(uri: string): Promise<string | null> {
    if (!this.#hasCache('GET', uri)) {
      const response = await this.#toastOnFailure(
        (): Promise<Response> => this.#http.GET(uri)
      );

      if (!response.ok) {
        return;
      }

      this.#setCache('GET', uri, await response.text());
    }

    return this.#getCache('GET', uri);
  }

  /**
   * @param path The directory path to invalidate cache for
   */
  invalidateCache(path: string): void {
    if (this.#hasCache('PROPFIND', path)) {
      this.#dropCache('PROPFIND', path);
    }
  }

  /**
   * @param uri The directory to list
   * @param bypassCache Force skipping cache
   */
  async list(uri: string, bypassCache: boolean = false): Promise<Collection> {
    uri = trailingSlash(uri);

    if (!bypassCache && this.#hasCache('PROPFIND', uri)) {
      return this.#getCache('PROPFIND', uri);
    }

    const check = await this.check(uri);

    if (!check || (!check.ok && check.status !== 405)) {
      return;
    }

    const data = await this.#toastOnFailure(
        (): Promise<Response> => this.#http.PROPFIND(uri)
      ),
      response = new DAVResponse(await data.text()),
      collection = response.collection({
        sortDirectoriesFirst: this.#sortDirectoriesFirst,
      });

    this.#setCache('PROPFIND', uri, collection);

    return collection;
  }

  /**
   * @param from The path to the file or directory to move
   * @param to The path of the directory to move to
   * @param entry The Entry object for the file or directory to move
   * @param overwrite
   */
  async move(
    from: string,
    to: string,
    entry: Entry,
    overwrite: boolean = false
  ): Promise<Response> {
    const destination = this.#validDestination(to);

    return this.#toastOnFailure(
      (): Promise<Response> =>
        this.#http.MOVE(from, {
          headers: {
            Destination: entry.directory
              ? trailingSlash(destination)
              : destination,
            Overwrite: overwrite ? 'T' : 'F',
          },
        })
    );
  }

  /**
   * @param path The path to upload the file to
   * @param file The File object to upload
   */
  async upload(
    path: string,
    file: File,
    onProgress: (uploadedBytes: number) => void = () => {}
  ): Promise<Response> {
    const targetFile = joinPath(path, file.name);

    return this.#toastOnFailure(
      (): Promise<Response> => this.#http.PUT(targetFile, file, onProgress)
    );
  }
}

export default DAV;
