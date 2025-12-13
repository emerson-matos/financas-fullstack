import { AxiosError } from "axios";

import { api } from "./api";

export const fetcher = async (url: string) => {
  try {
    const response = await api.get(url);

    // axios automatically parses JSON responses
    return response.data;
  } catch (error) {
    // Handle axios errors
    if (error instanceof AxiosError) {
      if (error.response) {
        // Server responded with error status
        throw new Error(`HTTP error! status: ${error.response.status}`);
      }
      if (error.request) {
        // Request was made but no response received
        throw new Error("Network error: No response received");
      }
      // Something else happened
      throw new Error(`Request failed: ${error.message}`);
    }
    // Non-axios error
    throw new Error(
      `Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
};
