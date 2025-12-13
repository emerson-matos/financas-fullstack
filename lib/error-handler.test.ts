import { describe, expect, it } from "vitest";

import { classifyError, ErrorSeverity, ErrorType } from "./error-handler";

describe("Error Handler", () => {
  it("should classify network errors correctly", () => {
    const networkError = {
      message: "Network Error",
      code: "ERR_NETWORK",
    };

    const result = classifyError(networkError);

    expect(result.type).toBe(ErrorType.NETWORK);
    expect(result.severity).toBe(ErrorSeverity.HIGH);
    expect(result.retryable).toBe(true);
    expect(result.userActionable).toBe(true);
  });

  it("should classify timeout errors correctly", () => {
    const timeoutError = {
      message: "timeout",
      code: "ECONNABORTED",
    };

    const result = classifyError(timeoutError);

    expect(result.type).toBe(ErrorType.TIMEOUT);
    expect(result.severity).toBe(ErrorSeverity.MEDIUM);
    expect(result.retryable).toBe(true);
    expect(result.userActionable).toBe(true);
  });

  it("should classify authentication errors correctly", () => {
    const authError = {
      response: { status: 401 },
      message: "Unauthorized",
    };

    const result = classifyError(authError);

    expect(result.type).toBe(ErrorType.AUTHENTICATION);
    expect(result.severity).toBe(ErrorSeverity.HIGH);
    expect(result.status).toBe(401);
    expect(result.retryable).toBe(false);
    expect(result.userActionable).toBe(true);
  });

  it("should classify server errors correctly", () => {
    const serverError = {
      response: { status: 500 },
      message: "Internal Server Error",
    };

    const result = classifyError(serverError);

    expect(result.type).toBe(ErrorType.SERVER);
    expect(result.severity).toBe(ErrorSeverity.HIGH);
    expect(result.status).toBe(500);
    expect(result.retryable).toBe(true);
    expect(result.userActionable).toBe(false);
  });

  it("should classify validation errors correctly", () => {
    const validationError = {
      response: { status: 422 },
      message: "Validation failed",
    };

    const result = classifyError(validationError);

    expect(result.type).toBe(ErrorType.VALIDATION);
    expect(result.severity).toBe(ErrorSeverity.LOW);
    expect(result.status).toBe(422);
    expect(result.retryable).toBe(false);
    expect(result.userActionable).toBe(true);
  });

  it("should classify unknown errors correctly", () => {
    const unknownError = new Error("Some random error");

    const result = classifyError(unknownError);

    expect(result.type).toBe(ErrorType.UNKNOWN);
    expect(result.severity).toBe(ErrorSeverity.MEDIUM);
    expect(result.retryable).toBe(false);
    expect(result.userActionable).toBe(false);
  });

  it("should include context in error classification", () => {
    const error = new Error("Test error");
    const context = {
      component: "TestComponent",
      action: "test-action",
    };

    const result = classifyError(error, context);

    expect(result.context).toEqual(context);
    expect(result.timestamp).toBeInstanceOf(Date);
  });
});
