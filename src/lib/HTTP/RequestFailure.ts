export class RequestFailure extends Error {
  #request: Request;
  #response: Response;

  constructor(request: Request, response: Response) {
    super('Request failure');

    this.#request = request;
    this.#response = response;
  }

  request(): Request {
    return this.#request;
  }

  response(): Response {
    return this.#response;
  }

  method(): string {
    return this.#request.method;
  }

  url(): string {
    return this.#request.url;
  }

  statusText(): string {
    return this.#response.statusText;
  }

  status(): number {
    return this.#response.status;
  }
}

export default RequestFailure;
