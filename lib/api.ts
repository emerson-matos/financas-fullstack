/**
 * Simple fetch-based API client for Next.js routes
 * No complex axios setup needed since routes handle auth via session cookies
 */

// Callback for error handling
let onError: ((error: Error) => void) | null = null;
export function setErrorCallback(callback: (error: Error) => void) {
  onError = callback;
}

interface FetchOptions extends RequestInit {
  _retry?: boolean;
  params?: Record<string, any>;
}

const DEFAULT_TIMEOUT = 10000;

function buildUrl(url: string, params?: Record<string, any>): string {
  if (!params) return url;

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${url}?${queryString}` : url;
}

async function fetchWithTimeout(
  url: string,
  options: FetchOptions = {},
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  try {
    const response = await fetch(`/api/${url}`, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export const api = {
  async get<T>(url: string, options?: FetchOptions): Promise<{ data: T }> {
    try {
      const finalUrl = buildUrl(url, options?.params);
      const { params, ...fetchOpts } = options || {};

      const response = await fetchWithTimeout(finalUrl, {
        ...fetchOpts,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...fetchOpts?.headers,
        },
      });

      if (!response.ok) {
        const error = new Error(`HTTP Error: ${response.status}`);
        if (onError) onError(error);
        throw error;
      }

      return await response.json();
    } catch (error) {
      if (onError && error instanceof Error) onError(error);
      throw error;
    }
  },

  async post<T>(
    endpoint: string,
    payload?: any,
    options?: FetchOptions,
  ): Promise<{ data: T }> {
    try {
      const response = await fetchWithTimeout(endpoint, {
        ...options,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        body: payload ? JSON.stringify(payload) : undefined,
      });

      if (!response.ok) {
        const error = new Error(`HTTP Error: ${response.status}`);
        if (onError) onError(error);
        throw error;
      }

      return await response.json();
    } catch (error) {
      if (onError && error instanceof Error) onError(error);
      throw error;
    }
  },

  async put<T>(
    endpoint: string,
    payload?: any,
    options?: FetchOptions,
  ): Promise<{ data: T }> {
    try {
      const response = await fetchWithTimeout(endpoint, {
        ...options,
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        body: payload ? JSON.stringify(payload) : undefined,
      });

      if (!response.ok) {
        const error = new Error(`HTTP Error: ${response.status}`);
        if (onError) onError(error);
        throw error;
      }

      return await response.json();
    } catch (error) {
      if (onError && error instanceof Error) onError(error);
      throw error;
    }
  },

  async patch<T>(
    endpoint: string,
    payload?: any,
    options?: FetchOptions,
  ): Promise<{ data: T }> {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${process.env.NEXT_PUBLIC_API_URL || "/api"}${endpoint}`;

    try {
      const response = await fetchWithTimeout(url, {
        ...options,
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        body: payload ? JSON.stringify(payload) : undefined,
      });

      if (!response.ok) {
        const error = new Error(`HTTP Error: ${response.status}`);
        if (onError) onError(error);
        throw error;
      }

      return await response.json();
    } catch (error) {
      if (onError && error instanceof Error) onError(error);
      throw error;
    }
  },

  async delete<T>(
    endpoint: string,
    options?: FetchOptions,
  ): Promise<{ data: T }> {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${process.env.NEXT_PUBLIC_API_URL || "/api"}${endpoint}`;

    try {
      const response = await fetchWithTimeout(url, {
        ...options,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const error = new Error(`HTTP Error: ${response.status}`);
        if (onError) onError(error);
        throw error;
      }

      return await response.json();
    } catch (error) {
      if (onError && error instanceof Error) onError(error);
      throw error;
    }
  },
};

export const downloadFile = async (url: string, filename?: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename || "download";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  } catch (_error) {
    throw new Error("Download failed");
  }
};
