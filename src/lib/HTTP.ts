import RequestFailure from './HTTP/RequestFailure';

type HTTPMethods =
  | 'CONNECT'
  | 'DELETE'
  | 'GET'
  | 'HEAD'
  | 'OPTIONS'
  | 'PATCH'
  | 'POST'
  | 'PUT'
  | 'TRACE';
type WebDAVMethods =
  | HTTPMethods
  | 'COPY'
  | 'LOCK'
  | 'MKCOL'
  | 'MOVE'
  | 'PROPFIND'
  | 'PROPPATCH'
  | 'UNLOCK';
type MethodParams = {
  [K in WebDAVMethods]?: RequestInit;
};

const defaultParams: MethodParams = {
  PROPFIND: {
    headers: {
      Depth: '1',
    },
  },
};

const method = async (
  method: string,
  url: RequestInfo,
  parameters: RequestInit
): Promise<Response> => {
  const request = new Request(url, {
    ...(defaultParams[method] || {}),
    ...parameters,
    method,
  });

  const response = await fetch(request);

  if (!response.ok) {
    throw new RequestFailure(request, response);
  }

  return response;
};

const methodXHR = async (
  method: string,
  url: RequestInfo,
  body: Document | XMLHttpRequestBodyInit | null = null,
  parameters: RequestInit = {},
  onProgress: (loaded: number) => void = () => {}
): Promise<Response> => {
  return new Promise<Response>(async (resolve, reject) => {
    const request = new Request(url, {
      ...(defaultParams[method] || {}),
      ...parameters,
      method,
    });

    const xhr = new XMLHttpRequest();

    xhr.open(request.method, request.url, true);
    request.headers.forEach((value, key) => xhr.setRequestHeader(key, value));
    xhr.upload.addEventListener('progress', (e) => onProgress(e.loaded), false);
    xhr.addEventListener('loadend', () => {
      // NOTE: first argument to `new Response()` must be null, if second argument contains `status: 204`.
      // But in XMLHttpRequest, `response` is always text, and in case of "204 No Content" response, it's empty string.
      // Let's fix it manually here.
      let xhr_response = xhr.response;
      if (xhr.status === 204) {
        xhr_response = null;
      }
      const response = new Response(xhr_response, {
        headers: xhr
          .getAllResponseHeaders()
          .trim()
          .split('\r\n')
          .map((line) => line.split(': ', 2) as [string, string]),
        status: xhr.status,
        statusText: xhr.statusText,
      });

      if (!response.ok) {
        reject(new RequestFailure(request, response));
      }

      resolve(response);
    });

    xhr.send(body);
  });
};

export class HTTP {
  GET(url: string, parameters: RequestInit = {}): Promise<Response> {
    return method('GET', url, parameters);
  }

  HEAD(url: string, parameters: RequestInit = {}): Promise<Response> {
    return method('HEAD', url, parameters);
  }

  PUT(
    url: string,
    file: File,
    onProgress: (uploadedBytes: number) => void = () => {},
    parameters: RequestInit = {}
  ): Promise<Response> {
    return methodXHR(
      'PUT',
      url,
      file,
      {
        ...parameters,
        headers: [['Content-Type', file.type]],
      },
      onProgress
    );
  }

  PROPFIND(url: string, parameters: RequestInit = {}): Promise<Response> {
    return method('PROPFIND', url, parameters);
  }

  DELETE(url: string, parameters: RequestInit = {}): Promise<Response> {
    return method('DELETE', url, parameters);
  }

  MKCOL(url: string, parameters: RequestInit = {}): Promise<Response> {
    return method('MKCOL', url, parameters);
  }

  COPY(url: string, parameters: RequestInit = {}): Promise<Response> {
    return method('COPY', url, parameters);
  }

  MOVE(url: string, parameters: RequestInit = {}): Promise<Response> {
    return method('MOVE', url, parameters);
  }
}

export default HTTP;
