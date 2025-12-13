import type { AxiosProgressEvent, AxiosRequestConfig } from "axios";
import type { Mocked } from "vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { api } from "@/lib/api";

import { DownloadManager, downloadFile } from "./file-download";

// Mock the API
vi.mock("@/lib/api", () => ({
  api: {
    get: vi.fn(),
  },
}));

const mockAppendChild = vi.fn();
const mockRemove = vi.fn();
const mockClick = vi.fn();
const mockCreateObjectURL = vi.fn(() => "mock-url");
const mockRevokeObjectURL = vi.fn();

global.document.createElement = vi.fn(() => ({
  href: "",
  download: "",
  click: mockClick,
  remove: mockRemove,
  style: {},
})) as unknown as () => HTMLAnchorElement;

global.document.body.appendChild = mockAppendChild;

global.window = {
  URL: {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
  },
  open: vi.fn(),
} as unknown as Window & typeof globalThis;

describe("DownloadManager", () => {
  let downloadManager: DownloadManager;
  let mockApi: Mocked<typeof api>;

  beforeEach(async () => {
    downloadManager = new DownloadManager();
    const { api } = await import("@/lib/api");
    mockApi = api as Mocked<typeof api>;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("downloadFile", () => {
    it("should download a file successfully", async () => {
      const mockBlob = new Blob(["test data"]);
      const mockResponse = { data: mockBlob };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await downloadManager.downloadFile("/api/test.csv", {
        filename: "test.csv",
      });

      expect(mockApi.get).toHaveBeenCalledWith("/api/test.csv", {
        responseType: "blob",
        timeout: 30000,
        signal: expect.any(AbortSignal),
        onDownloadProgress: expect.any(Function),
      });

      expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(document.createElement).toHaveBeenCalledWith("a");
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemove).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith("mock-url");

      expect(result.success).toBe(true);
      expect(result.filename).toBe("test.csv");
    });

    it("should call onProgress callback during download", async () => {
      const onProgress = vi.fn();
      mockApi.get.mockImplementation(
        (_url: string, config?: AxiosRequestConfig) => {
          // Simulate progress event
          if (config?.onDownloadProgress) {
            config.onDownloadProgress({
              loaded: 50,
              total: 100,
            } as AxiosProgressEvent);
          }
          return Promise.resolve({ data: new Blob() });
        },
      );

      await downloadManager.downloadFile("/api/test.csv", {
        onProgress,
      });

      expect(onProgress).toHaveBeenCalledWith(50);
    });

    it("should use the filename from the URL if not provided", async () => {
      const mockBlob = new Blob(["test data"]);
      const mockResponse = { data: mockBlob };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await downloadManager.downloadFile("/api/test.csv");

      expect(result.success).toBe(true);
      expect(result.filename).toBe("test.csv");
    });

    it("should use a default filename if not provided and not in URL", async () => {
      const mockBlob = new Blob(["test data"]);
      const mockResponse = { data: mockBlob };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await downloadManager.downloadFile("/api/download");

      expect(result.success).toBe(true);
      expect(result.filename).toBe("download");
    });

    it("should handle download failure", async () => {
      const mockError = new Error("Network Error");
      mockApi.get.mockRejectedValue(mockError);

      const result = await downloadManager.downloadFile("/api/test.csv", {
        filename: "test.csv",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Network Error");
    });

    it("should handle download cancellation", async () => {
      const abortError = new DOMException("AbortError", "AbortError");
      mockApi.get.mockRejectedValue(abortError);

      const result = await downloadManager.downloadFile("/api/test.csv");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Download cancelled");
    });

    it("should have a configurable timeout", async () => {
      const mockBlob = new Blob(["test data"]);
      const mockResponse = { data: mockBlob };
      mockApi.get.mockResolvedValue(mockResponse);

      await downloadManager.downloadFile("/api/test.csv", { timeout: 10000 });

      expect(mockApi.get).toHaveBeenCalledWith(
        "/api/test.csv",
        expect.objectContaining({ timeout: 10000 }),
      );
    });
  });

  describe("cancelDownload", () => {
    it("should abort the download", async () => {
      const getSpy = vi
        .spyOn(mockApi, "get")
        .mockRejectedValue(new DOMException("AbortError", "AbortError"));

      const downloadPromise = downloadManager.downloadFile("/api/test.csv");
      downloadManager.cancelDownload();

      await expect(downloadPromise).resolves.toEqual({
        success: false,
        error: "Download cancelled",
      });

      expect(getSpy).toHaveBeenCalled();
    });

    it("should not throw if no download is in progress", () => {
      expect(() => downloadManager.cancelDownload()).not.toThrow();
    });
  });

  describe("getFilenameFromUrl", () => {
    it("should return a default filename for an empty URL", async () => {
      vi.spyOn(mockApi, "get").mockResolvedValue({ data: new Blob() });
      const result = await downloadManager.downloadFile("");
      expect(result.filename).toBe("download");
    });

    it("should return a default filename for an invalid URL", async () => {
      vi.spyOn(mockApi, "get").mockResolvedValue({ data: new Blob() });
      const result = await downloadManager.downloadFile("invalid-url");
      expect(result.filename).toBe("invalid-url");
    });
  });
});

describe("downloadFile convenience function", () => {
  it("should use DownloadManager correctly", async () => {
    const { api } = await import("@/lib/api");
    const mockApi = api as Mocked<typeof api>;

    const mockResponse = {
      data: new Blob(["test data"]),
    };
    vi.spyOn(mockApi, "get").mockResolvedValue(mockResponse);
    const onProgress = vi.fn();

    const result = await downloadFile("/api/test.csv", "test.csv", onProgress);

    expect(mockApi.get).toHaveBeenCalledWith("/api/test.csv", {
      responseType: "blob",
      timeout: 30000,
      signal: expect.any(AbortSignal),
      onDownloadProgress: expect.any(Function),
    });
    expect(result.success).toBe(true);
    expect(result.filename).toBe("test.csv");
  });
});
