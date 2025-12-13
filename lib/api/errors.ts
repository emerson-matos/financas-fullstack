export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errorKey?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class BadRequestAlertException extends ApiError {
  constructor(message: string, entityName: string, errorKey: string) {
    super(400, message, errorKey);
    this.name = "BadRequestAlertException";
  }
}

export class NotFoundException extends ApiError {
  constructor(message: string, entityName: string, errorKey: string) {
    super(404, message, errorKey);
    this.name = "NotFoundException";
  }
}

export class UnauthorizedException extends ApiError {
  constructor(message: string) {
    super(401, message, "unauthorized");
    this.name = "UnauthorizedException";
  }
}

export class ForbiddenException extends ApiError {
  constructor(message: string) {
    super(403, message, "forbidden");
    this.name = "ForbiddenException";
  }
}
