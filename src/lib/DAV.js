import EventObject from './EventObject.js';
import HTTP from './HTTP.js';
import Response from './DAV/Response.js';
import joinPath from './joinPath.js';

export default class DAV extends EventObject {
  #bypassCheck;
  #cache;
  #http;

  #validDestination = (destination) => {
    const hostname = `${location.protocol}//${location.hostname}${location.port ? `:${location.port}` : ''}`,
      hostnameRegExp = new RegExp(`^${hostname}`)
    ;

    if (! destination.match(hostnameRegExp)) {
      if (destination.match(/^http/)) {
        throw new TypeError(`Invalid destination host: '${destination}'.`);
      }

      return `${hostname}${destination}`;
    }

    return destination;
  };

  #dispatchWithEvents = (func, eventName, ...params) => {
    this.trigger(`${eventName}:request`, ...params);

    return func()
      .then((response) => {
        if (! response) {
          this.trigger(`${eventName}:failed`, ...params);

          return response;
        }

        this.trigger(`${eventName}:success`, ...params);

        return response;
      })
      .catch(() => {
        this.trigger(`${eventName}:failed`, ...params);
      })
    ;
  };

  constructor({
    bypassCheck
  }, cache = new Map(), http = new HTTP()) {
    super();

    this.#bypassCheck = bypassCheck;
    this.#cache = cache;
    this.#http  = http;

    this.bindEvents();
  }

  bindEvents() {
    this.on('cache:invalidate', (path) => {
      if (this.#cache.has(path)) {
        this.#cache.delete(path);
      }
    });
  }

  async check(uri) {
    if (this.#bypassCheck) {
      return {
        ok: true,
        status: 200
      };
    }

    return this.#http.HEAD(uri);
  }

  async copy(from, to, entry) {
    return this.#dispatchWithEvents(() => this.#http.COPY(from, {
      headers: {
        Destination: this.#validDestination(to)
      }
    }), 'copy', from, to, entry);
  }

  async del(uri, entry) {
    return this.#dispatchWithEvents(() => this.#http.DELETE(uri), 'delete', uri, entry);
  }

  async get(uri) {
    return this.#dispatchWithEvents(() => this.#http.GET(uri), 'get', uri);
  }

  async list(uri, bypassCache) {
    if (! uri.match(/\/$/)) {
      uri = `${uri}/`;
    }

    if (! bypassCache) {
      const cached = await this.#cache.get(uri);

      if (cached) {
        return cached;
      }
    }

    const check = await this.check(uri);

    if (! check || (! check.ok && check.status !== 405)) {
      return;
    }

    const data = await this.#http.PROPFIND(uri),
      response = new Response(await data.text()),
      collection = response.collection()
    ;

    this.#cache.set(uri, collection);

    return collection;
  }

  async mkcol(fullPath, directoryName, path) {
    return this.#dispatchWithEvents(() => this.#http.MKCOL(fullPath), 'mkcol', fullPath, directoryName, path);
  }

  async move(from, to, entry) {
    return this.#dispatchWithEvents(() => this.#http.MOVE(from, {
      headers: {
        Destination: this.#validDestination(to)
      }
    }), 'move', from, to, entry);
  }

  async upload(path, file) {
    const targetFile = joinPath(path, file.name);

    return this.#dispatchWithEvents(() => this.#http.PUT(targetFile, {
      headers: {
        'Content-Type': file.type
      },
      body: file
    }), 'upload', path, file);
  }
}
