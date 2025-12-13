import { classifyError, ErrorType } from "./error-handler";

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
};

export class RetryHandler {
  private config: RetryConfig;

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = { ...defaultRetryConfig, ...config };
  }

  async retry<T>(
    operation: () => Promise<T>,
    shouldRetry?: (error: unknown) => boolean,
  ): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: unknown) {
        lastError = error;

        // Check if we should retry
        if (!this.shouldRetry(error, attempt, shouldRetry)) {
          throw error;
        }

        // Wait before retry
        if (attempt < this.config.maxRetries) {
          const delay = this.calculateDelay(attempt);
          await this.delay(delay);
        }
      }
    }

    throw lastError;
  }

  private shouldRetry(
    error: unknown,
    attempt: number,
    customShouldRetry?: (error: unknown) => boolean,
  ): boolean {
    // Don't retry if we've reached max attempts
    if (attempt >= this.config.maxRetries) {
      return false;
    }

    // Use custom retry logic if provided
    if (customShouldRetry) {
      return customShouldRetry(error);
    }

    // Default retry logic
    const apiError = classifyError(error);

    // Type guard for error object with response property
    const hasResponse = (
      err: unknown,
    ): err is { response?: { status?: number } } => {
      return typeof err === "object" && err !== null && "response" in err;
    };

    // Don't retry on 4xx errors (except rate limits)
    if (
      apiError.type !== ErrorType.RATE_LIMIT &&
      hasResponse(error) &&
      error.response?.status !== undefined &&
      error.response.status >= 400 &&
      error.response.status < 500
    ) {
      return false;
    }

    // Retry on network errors, timeouts, and server errors
    return [
      ErrorType.NETWORK,
      ErrorType.TIMEOUT,
      ErrorType.SERVER,
      ErrorType.RATE_LIMIT,
    ].includes(apiError.type);
  }

  private calculateDelay(attempt: number): number {
    const delay =
      this.config.baseDelay * this.config.backoffMultiplier ** (attempt - 1);
    return Math.min(delay, this.config.maxDelay);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const retryHandler = new RetryHandler();
