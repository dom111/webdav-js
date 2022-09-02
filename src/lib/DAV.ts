import Collection from './Collection';
import DAVResponse from './Response';
import Entry from './Entry';
import HTTP from './HTTP';
import RequestFailure from './HTTP/RequestFailure';
import { error } from 'melba-toast';
import joinPath from './joinPath';
import { t } from 'i18next';
import trailingSlash from './trailingSlash';

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

export default class DAV {
  #bypassCheck: boolean;
  #cache: RequestCache;
  #http: HTTP;
  #sortDirectoriesFirst: boolean;

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
    func: () => Promise<Response>
  ): Promise<Response> => {
    try {
      return await func();
    } catch (e) {
      if (!(e instanceof RequestFailure)) {
        throw e;
      }

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

  async check(uri): Promise<{
    ok: boolean;
    status: number;
  }> {
    if (this.#bypassCheck) {
      return Promise.resolve({
        ok: true,
        status: 200,
      });
    }

    return this.#toastOnFailure((): Promise<Response> => this.#http.HEAD(uri));
  }

  async copy(from, to): Promise<Response> {
    return this.#toastOnFailure(
      (): Promise<Response> =>
        this.#http.COPY(from, {
          headers: {
            Destination: this.#validDestination(to),
          },
        })
    );
  }

  async del(uri): Promise<Response> {
    return this.#toastOnFailure(
      (): Promise<Response> => this.#http.DELETE(uri)
    );
  }

  async get(uri): Promise<string | null> {
    if (!this.#hasCache('GET', uri)) {
      const response = await this.#toastOnFailure(
        (): Promise<Response> => this.#http.GET(uri)
      );

      if (!response || !response.ok) {
        return;
      }

      this.#setCache('GET', uri, await response.text());
    }

    return this.#getCache('GET', uri);
  }

  async list(uri, bypassCache = false): Promise<Collection> {
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

  async mkcol(fullPath) {
    return this.#toastOnFailure(
      (): Promise<Response> => this.#http.MKCOL(fullPath)
    );
  }

  async move(from: string, to: string, entry: Entry): Promise<Response> {
    const destination = this.#validDestination(to);

    return this.#toastOnFailure(
      (): Promise<Response> =>
        this.#http.MOVE(from, {
          headers: {
            Destination: entry.directory
              ? trailingSlash(destination)
              : destination,
          },
        })
    );
  }

  async upload(path, file): Promise<Response> {
    const targetFile = joinPath(path, file.name);

    return this.#toastOnFailure(
      (): Promise<Response> =>
        this.#http.PUT(targetFile, {
          headers: {
            'Content-Type': file.type,
          },
          body: file,
        })
    );
  }
}
