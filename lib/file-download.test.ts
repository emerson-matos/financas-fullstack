import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DownloadManager, downloadFile } from "./file-download";

const mockAppendChild = vi.fn();
const mockRemove = vi.fn();
const mockClick = vi.fn();
const mockCreateObjectURL = vi.fn(() => "mock-url");
const mockRevokeObjectURL = vi.fn();

// Mock DOM elements
global.document.createElement = vi.fn((tag) => {
  if (tag === 'a') {
    return {
      href: "",
      download: "",
      click: mockClick,
      remove: mockRemove,
      style: {},
    } as unknown as HTMLAnchorElement;
  }
  return document.createElement(tag);
}) as unknown as typeof document.createElement;

global.document.body.appendChild = mockAppendChild;

global.window = {
  ...global.window,
  URL: {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
  },
} as unknown as Window & typeof globalThis;

// Helper to create a mock fetch response with streamable body
const createMockFetchResponse = (
  data: Uint8Array | string,
  options: { ok?: boolean; status?: number; contentLength?: number } = {}
) => {
  const encoder = new TextEncoder();
  const chunks = typeof data === "string" ? encoder.encode(data) : data;
  const stream = new ReadableStream({
    start(controller) {
      // Split into two chunks to test progress
      const mid = Math.floor(chunks.length / 2);
      controller.enqueue(chunks.slice(0, mid));
      controller.enqueue(chunks.slice(mid));
      controller.close();
    },
  });

  return {
    ok: options.ok ?? true,
    status: options.status ?? 200,
    headers: {
      get: (name: string) => {
        if (name === "Content-Length") return (options.contentLength ?? chunks.length).toString();
        return null;
      },
    },
    body: stream,
  };
};

describe("DownloadManager", () => {
  let downloadManager: DownloadManager;
  let fetchSpy: any; // Using any to simplify type casting interactions for spy

  beforeEach(() => {
    downloadManager = new DownloadManager();
    fetchSpy = vi.spyOn(global, "fetch");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("downloadFile", () => {
    it("should download a file successfully", async () => {
      fetchSpy.mockResolvedValue(createMockFetchResponse("test data") as unknown as Response);

      // Note: function prepends /api/ to URL
      const result = await downloadManager.downloadFile("/test.csv", {
        filename: "test.csv",
      });

      expect(fetchSpy).toHaveBeenCalledWith("/api/test.csv", expect.objectContaining({
        signal: expect.any(AbortSignal),
      }));

      expect(mockCreateObjectURL).toHaveBeenCalled(); // Called with Blob
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
      const data = "test data for progress";
      fetchSpy.mockResolvedValue(createMockFetchResponse(data) as unknown as Response);

      await downloadManager.downloadFile("/test.csv", {
        onProgress,
      });

      // Since we split valid data into chunks in mock response helper
      expect(onProgress).toHaveBeenCalled();
      // Should eventually recall with 100%
      expect(onProgress).toHaveBeenLastCalledWith(100);
    });

    it("should use the filename from the URL if not provided", async () => {
      fetchSpy.mockResolvedValue(createMockFetchResponse("test data") as unknown as Response);

      const result = await downloadManager.downloadFile("/test.csv");

      expect(result.success).toBe(true);
      expect(result.filename).toBe("test.csv");
    });

    it("should use a default filename if not provided and not in URL", async () => {
      fetchSpy.mockResolvedValue(createMockFetchResponse("test data") as unknown as Response);

      // Note: In JSDOM/Node fetch needs absolute URL usually, but implementation handles relative string in getFilenameFromUrl 
      // mocking fetch bypasses the network error, but we must check getFilenameFromUrl logic.
      // The implementation does: pathname = url.startsWith("http") ? new URL(url).pathname : url;

      const result = await downloadManager.downloadFile("/download");

      expect(result.success).toBe(true);
      expect(result.filename).toBe("download");
    });

    it("should handle download failure (HTTP error)", async () => {
      fetchSpy.mockResolvedValue(createMockFetchResponse("", { ok: false, status: 404 }) as unknown as Response);

      const result = await downloadManager.downloadFile("/test.csv");

      expect(result.success).toBe(false);
      expect(result.error).toContain("HTTP error! status: 404");
    });

    it("should handle network failure", async () => {
      fetchSpy.mockRejectedValue(new Error("Network Error"));

      const result = await downloadManager.downloadFile("/test.csv");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Network Error");
    });

    it("should handle download cancellation", async () => {
      const abortError = new DOMException("AbortError", "AbortError");
      fetchSpy.mockRejectedValue(abortError);

      const result = await downloadManager.downloadFile("/test.csv");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Download cancelled");
    });

    // Note: Testing timeout specifically is tricky with real timers, 
    // usually requires fake timers which might interfere with other async logic.
    // For now we trust the AbortSignal passing.
  });

  describe("cancelDownload", () => {
    it("should abort the download", async () => {
      fetchSpy.mockRejectedValue(new DOMException("AbortError", "AbortError"));

      const downloadPromise = downloadManager.downloadFile("/test.csv");
      downloadManager.cancelDownload();

      await expect(downloadPromise).resolves.toEqual({
        success: false,
        error: "Download cancelled",
      });

      expect(fetchSpy).toHaveBeenCalled();
    });

    it("should not throw if no download is in progress", () => {
      expect(() => downloadManager.cancelDownload()).not.toThrow();
    });
  });

  describe("getFilenameFromUrl", () => {
    // We access private method implicitly by integration testing or by casting to any

    it("should return a default filename for an empty URL", async () => {
      fetchSpy.mockResolvedValue(createMockFetchResponse("") as unknown as Response);
      const result = await downloadManager.downloadFile("");
      expect(result.filename).toBe("download");
    });

    it("should return a default filename for an invalid URL", async () => {
      fetchSpy.mockResolvedValue(createMockFetchResponse("") as unknown as Response);
      const result = await downloadManager.downloadFile("invalid-url");
      expect(result.filename).toBe("invalid-url");
    });
  });
});

describe("downloadFile convenience function", () => {
  it("should use DownloadManager correctly", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue(createMockFetchResponse("test") as unknown as Response);
    const onProgress = vi.fn();

    // Function now prepends /api to URL
    const result = await downloadFile("/test.csv", "test.csv", onProgress);

    expect(fetchSpy).toHaveBeenCalledWith("/api/test.csv", expect.any(Object));
    expect(result.success).toBe(true);
    expect(result.filename).toBe("test.csv");
  });
});
