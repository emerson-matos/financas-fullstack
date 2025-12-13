export interface DownloadOptions {
  filename?: string;
  onProgress?: (progress: number) => void;
  timeout?: number;
}

export interface DownloadResult {
  success: boolean;
  filename?: string;
  error?: string;
}

export class DownloadManager {
  private abortController: AbortController | null = null;

  async downloadFile(
    url: string,
    options: DownloadOptions = {},
  ): Promise<DownloadResult> {
    const { filename, onProgress, timeout = 30000 } = options;
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController?.abort(), timeout);

    try {
      const response = await fetch(url, {
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get total size from Content-Length header
      const contentLength = response.headers.get("Content-Length");
      const total = contentLength ? parseInt(contentLength, 10) : 0;

      // Read the response body as a stream to track progress
      const reader = response.body?.getReader();
      const chunks = [];
      let loaded = 0;

      if (reader)
        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          chunks.push(value);
          loaded += value.length;

          // Call progress callback
          if (onProgress && total) {
            const percentCompleted = Math.round((loaded * 100) / total);
            onProgress(percentCompleted);
          }
        }

      // Create blob from chunks
      const blob = new Blob(chunks);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename || this.getFilenameFromUrl(url);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      return {
        success: true,
        filename: link.download,
      };
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return {
          success: false,
          error: "Download cancelled",
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "Download failed",
      };
    } finally {
      clearTimeout(timeoutId);
      this.abortController = null;
    }
  }

  cancelDownload() {
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  private getFilenameFromUrl(url: string): string {
    try {
      // Use pathname directly if it's a relative URL, or parse if it's absolute
      const pathname = url.startsWith("http") ? new URL(url).pathname : url;
      const filename = pathname.split("/").pop();
      return filename || "download";
    } catch {
      return "download";
    }
  }
}

export const downloadManager = new DownloadManager();

// Convenience function
export const downloadFile = (
  url: string,
  filename?: string,
  onProgress?: (progress: number) => void,
): Promise<DownloadResult> => {
  return downloadManager.downloadFile(url, { filename, onProgress });
};
