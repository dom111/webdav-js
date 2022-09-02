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

export class HTTP {
  GET(url: string, parameters: RequestInit = {}): Promise<Response> {
    return method('GET', url, parameters);
  }

  HEAD(url: string, parameters: RequestInit = {}): Promise<Response> {
    return method('HEAD', url, parameters);
  }

  PUT(url: string, parameters: RequestInit = {}): Promise<Response> {
    return method('PUT', url, parameters);
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
