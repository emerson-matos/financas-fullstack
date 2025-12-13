import { api } from "@/lib/api";

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

    try {
      this.abortController = new AbortController();

      const response = await api.get(url, {
        responseType: "blob",
        timeout,
        signal: this.abortController.signal,
        onDownloadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            onProgress(percentCompleted);
          }
        },
      });

      const blob = new Blob([response.data]);
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
