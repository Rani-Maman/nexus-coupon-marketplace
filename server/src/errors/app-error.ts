export class AppError extends Error {
  constructor(
    public readonly errorCode: string,
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = "AppError";
  }
}
