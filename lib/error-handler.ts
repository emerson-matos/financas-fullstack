export enum ErrorType {
  NETWORK = "network",
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  VALIDATION = "validation",
  SERVER = "server",
  TIMEOUT = "timeout",
  RATE_LIMIT = "rate_limit",
  MAINTENANCE = "maintenance",
  UNKNOWN = "unknown",
}

export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export interface ApiError {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  status?: number;
  code?: string;
  retryable: boolean;
  userActionable: boolean;
  timestamp: Date;
  requestId?: string;
  context?: ErrorContext;
}

export interface ErrorContext {
  url?: string;
  method?: string;
  userId?: string;
  component?: string;
  action?: string;
}

export const classifyError = (
  error: unknown,
  context?: ErrorContext,
): ApiError => {
  const timestamp = new Date();
  const baseError: ApiError = {
    type: ErrorType.UNKNOWN,
    severity: ErrorSeverity.MEDIUM,
    message: "An unexpected error occurred",
    retryable: false,
    userActionable: false,
    timestamp,
    context,
  };

  // Type guard for error object
  const isErrorObject = (
    err: unknown,
  ): err is {
    code?: string;
    message?: string;
    response?: { status?: number };
  } => {
    return typeof err === "object" && err !== null;
  };

  if (!isErrorObject(error)) {
    return baseError;
  }

  // Network errors
  if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
    return {
      ...baseError,
      type: ErrorType.TIMEOUT,
      severity: ErrorSeverity.MEDIUM,
      message: "Request timed out. Please check your connection and try again.",
      retryable: true,
      userActionable: true,
    };
  }

  if (error.code === "ERR_NETWORK" || error.message?.includes("network")) {
    return {
      ...baseError,
      type: ErrorType.NETWORK,
      severity: ErrorSeverity.HIGH,
      message: "Network error. Please check your internet connection.",
      retryable: true,
      userActionable: true,
    };
  }

  // HTTP status errors
  if (error.response?.status) {
    const status = error.response.status;

    switch (status) {
      case 401:
        return {
          ...baseError,
          type: ErrorType.AUTHENTICATION,
          severity: ErrorSeverity.HIGH,
          message: "Your session has expired. Please log in again.",
          status,
          retryable: false,
          userActionable: true,
        };

      case 403:
        return {
          ...baseError,
          type: ErrorType.AUTHORIZATION,
          severity: ErrorSeverity.MEDIUM,
          message: "You do not have permission to perform this action.",
          status,
          retryable: false,
          userActionable: true,
        };

      case 404:
        return {
          ...baseError,
          type: ErrorType.SERVER,
          severity: ErrorSeverity.MEDIUM,
          message: "The requested resource was not found.",
          status,
          retryable: false,
          userActionable: false,
        };

      case 422:
        return {
          ...baseError,
          type: ErrorType.VALIDATION,
          severity: ErrorSeverity.LOW,
          message: "Please check your input and try again.",
          status,
          retryable: false,
          userActionable: true,
        };

      case 429:
        return {
          ...baseError,
          type: ErrorType.RATE_LIMIT,
          severity: ErrorSeverity.MEDIUM,
          message: "Too many requests. Please wait a moment and try again.",
          status,
          retryable: true,
          userActionable: true,
        };

      case 503:
        return {
          ...baseError,
          type: ErrorType.MAINTENANCE,
          severity: ErrorSeverity.HIGH,
          message:
            "Service is temporarily unavailable. Please try again later.",
          status,
          retryable: true,
          userActionable: false,
        };

      default:
        if (status >= 500) {
          return {
            ...baseError,
            type: ErrorType.SERVER,
            severity: ErrorSeverity.HIGH,
            message: "Server error. Please try again later.",
            status,
            retryable: true,
            userActionable: false,
          };
        }
    }
  }

  return baseError;
};
