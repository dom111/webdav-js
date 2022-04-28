import EventObject from './EventObject';

const defaultParams = {
  PROPFIND: {
    headers: {
      Depth: 1,
    },
  },
};

const method = (
  method: string,
  url: RequestInfo,
  parameters: RequestInit,
  object: HTTP
) =>
  fetch(url, {
    ...(defaultParams[method] || null),
    ...parameters,
    method,
  }).then((response) => {
    if (!response.ok) {
      object.trigger('error', {
        method,
        url,
        response,
      });

      return;
    }

    return response;
  });

export default class HTTP extends EventObject {
  GET(url: string, parameters: RequestInit = {}) {
    return method('GET', url, parameters, this);
  }

  HEAD(url: string, parameters: RequestInit = {}) {
    return method('HEAD', url, parameters, this);
  }

  PUT(url: string, parameters: RequestInit = {}) {
    return method('PUT', url, parameters, this);
  }

  PROPFIND(url: string, parameters: RequestInit = {}) {
    return method('PROPFIND', url, parameters, this);
  }

  DELETE(url: string, parameters: RequestInit = {}) {
    return method('DELETE', url, parameters, this);
  }

  MKCOL(url: string, parameters: RequestInit = {}) {
    return method('MKCOL', url, parameters, this);
  }

  COPY(url: string, parameters: RequestInit = {}) {
    return method('COPY', url, parameters, this);
  }

  MOVE(url: string, parameters: RequestInit = {}) {
    return method('MOVE', url, parameters, this);
  }
}
