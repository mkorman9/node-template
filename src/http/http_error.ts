export class HTTPResponseError extends Error {
  constructor(
    public statusCode: number,
    public response: {
      type: string;
      title?: string;
      cause?: unknown;
    }
  ) {
    super();
  }
}
