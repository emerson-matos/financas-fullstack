import { QueryClient } from "@tanstack/react-query";

const createQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // 3 seconds, up to 10 seconds
        retry: (failureCount, error: unknown) => {
          // Don't retry on 4xx errors
          const { response } = error as { response?: { status?: number } };
          if (
            response?.status &&
            response.status >= 400 &&
            response.status < 500
          ) {
            return false;
          }
          return failureCount < 3;
        },
      },
      mutations: {
        // Error handling will be done in individual mutations
      },
    },
  });
};

export const queryClient = createQueryClient();
