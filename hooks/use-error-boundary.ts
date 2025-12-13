import { useCallback, useEffect, useState } from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: unknown;
}

interface UseErrorBoundaryOptions {
  onError?: (error: Error, errorInfo?: unknown) => void;
  enableGlobalErrorHandling?: boolean;
}

export const useErrorBoundary = (options: UseErrorBoundaryOptions = {}) => {
  const { onError, enableGlobalErrorHandling = true } = options;
  const [state, setState] = useState<ErrorBoundaryState>({ hasError: false });

  const handleError = useCallback(
    (error: Error, errorInfo?: unknown) => {
      setState({ hasError: true, error, errorInfo });

      // Log error in development
      if (process.env.NODE_ENV === "development") {
        console.error("Error caught by boundary:", error, errorInfo);
      }

      // Call custom error handler
      onError?.(error, errorInfo);
    },
    [onError],
  );

  const resetError = useCallback(() => {
    setState({ hasError: false, error: undefined, errorInfo: undefined });
  }, []);

  // Global error handling
  useEffect(() => {
    if (!enableGlobalErrorHandling) {
      return;
    }

    const handleGlobalError = (event: ErrorEvent) => {
      const error = event.error || new Error(event.message);
      const errorInfo = {
        componentStack: event.filename
          ? `at ${event.filename}:${event.lineno}:${event.colno}`
          : undefined,
        type: "global-error",
      };

      handleError(error, errorInfo);
      event.preventDefault();
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error =
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason));
      const errorInfo = {
        componentStack: "Unhandled Promise Rejection",
        type: "unhandled-rejection",
      };

      handleError(error, errorInfo);
      event.preventDefault();
    };

    window.addEventListener("error", handleGlobalError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection,
      );
    };
  }, [handleError, enableGlobalErrorHandling]);

  return {
    hasError: state.hasError,
    error: state.error,
    errorInfo: state.errorInfo,
    handleError,
    resetError,
  };
};

// Hook for catching async errors
export const useAsyncError = () => {
  const [, setError] = useState();

  return useCallback((error: Error) => {
    setError(() => {
      throw error;
    });
  }, []);
};

// Hook for error boundary with automatic retry
export const useErrorBoundaryWithRetry = (maxRetries = 3) => {
  const [retryCount, setRetryCount] = useState(0);
  const { hasError, error, errorInfo, handleError, resetError } =
    useErrorBoundary();

  const retry = useCallback(() => {
    if (retryCount < maxRetries) {
      setRetryCount((prev) => prev + 1);
      resetError();
    }
  }, [retryCount, maxRetries, resetError]);

  const canRetry = retryCount < maxRetries;

  return {
    hasError,
    error,
    errorInfo,
    handleError,
    resetError,
    retry,
    retryCount,
    canRetry,
    maxRetries,
  };
};
