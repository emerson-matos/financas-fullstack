import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  CSVFileHandler,
  ExcelFileHandler,
  fileHandlers,
  getFileHandler,
  JSONFileHandler,
} from "./file-handlers";

// Mock DOM methods
const mockCreateElement = vi.fn();
const mockAppendChild = vi.fn();
const mockClick = vi.fn();
const mockRemove = vi.fn();
const mockCreateObjectURL = vi.fn();
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

describe("File Handlers", () => {
  beforeEach(() => {
    const mockLink = {
      href: "",
      download: "",
      click: mockClick,
      remove: mockRemove,
    };
    mockCreateElement.mockReturnValue(mockLink);
    mockCreateObjectURL.mockReturnValue("blob:mock-url");
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("CSVFileHandler", () => {
    let handler: CSVFileHandler;

    beforeEach(() => {
      handler = new CSVFileHandler();
    });

    describe("canHandle", () => {
      it("should handle CSV MIME type", () => {
        expect(handler.canHandle("text/csv")).toBe(true);
      });

      it("should handle plain text MIME type", () => {
        expect(handler.canHandle("text/plain")).toBe(true);
      });

      it("should handle CSV with additional parameters", () => {
        expect(handler.canHandle("text/csv; charset=utf-8")).toBe(true);
      });

      it("should not handle other MIME types", () => {
        expect(handler.canHandle("application/json")).toBe(false);
        expect(handler.canHandle("application/pdf")).toBe(false);
      });
    });

    describe("process", () => {
      it("should process CSV file and trigger download", async () => {
        const mockLink = {
          href: "",
          download: "",
          click: vi.fn(),
          remove: vi.fn(),
        };
        const createElementSpy = vi
          .spyOn(document, "createElement")
          .mockReturnValue(mockLink as unknown as HTMLAnchorElement);

        const csvData = "name,age\nJohn,30\nJane,25";
        const blob = new Blob([csvData], { type: "text/csv" });

        // Mock blob.text()
        blob.text = vi.fn().mockResolvedValue(csvData);

        await handler.process(blob, "test-data");

        expect(blob.text).toHaveBeenCalled();
        expect(mockCreateObjectURL).toHaveBeenCalledWith(
          expect.objectContaining({ type: "text/csv" }),
        );
        expect(createElementSpy).toHaveBeenCalledWith("a");
        expect(mockLink.click).toHaveBeenCalled();
        expect(mockLink.remove).toHaveBeenCalled();
        expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
      });

      it("should add .csv extension if not present", async () => {
        const mockLink = {
          href: "",
          download: "",
          click: vi.fn(),
          remove: vi.fn(),
        };
        const createElementSpy = vi
          .spyOn(document, "createElement")
          .mockReturnValue(mockLink as unknown as HTMLAnchorElement);
        const csvData = "name,age\nJohn,30";
        const blob = new Blob([csvData], { type: "text/csv" });
        blob.text = vi.fn().mockResolvedValue(csvData);

        await handler.process(blob, "test-data");

        expect(mockLink.download).toBe("test-data.csv");
        createElementSpy.mockRestore();
      });

      it("should not add .csv extension if already present", async () => {
        const mockLink = {
          href: "",
          download: "",
          click: vi.fn(),
          remove: vi.fn(),
        };
        const createElementSpy = vi
          .spyOn(document, "createElement")
          .mockReturnValue(mockLink as unknown as HTMLAnchorElement);
        const csvData = "name,age\nJohn,30";
        const blob = new Blob([csvData], { type: "text/csv" });
        blob.text = vi.fn().mockResolvedValue(csvData);

        await handler.process(blob, "test-data.csv");

        expect(mockLink.download).toBe("test-data.csv");
        createElementSpy.mockRestore();
      });
    });
  });

  describe("JSONFileHandler", () => {
    let handler: JSONFileHandler;

    beforeEach(() => {
      handler = new JSONFileHandler();
    });

    describe("canHandle", () => {
      it("should handle JSON MIME type", () => {
        expect(handler.canHandle("application/json")).toBe(true);
      });

      it("should handle JSON with additional parameters", () => {
        expect(handler.canHandle("application/json; charset=utf-8")).toBe(true);
      });

      it("should not handle other MIME types", () => {
        expect(handler.canHandle("text/csv")).toBe(false);
        expect(handler.canHandle("application/pdf")).toBe(false);
      });
    });

    describe("process", () => {
      it("should process JSON file and trigger download", async () => {
        const mockLink = {
          href: "",
          download: "",
          click: vi.fn(),
          remove: vi.fn(),
        };
        const createElementSpy = vi
          .spyOn(document, "createElement")
          .mockReturnValue(mockLink as unknown as HTMLAnchorElement);
        const jsonData = '{"name": "John", "age": 30}';
        const blob = new Blob([jsonData], { type: "application/json" });
        blob.text = vi.fn().mockResolvedValue(jsonData);

        await handler.process(blob, "test-data.json");

        expect(blob.text).toHaveBeenCalled();
        expect(mockCreateObjectURL).toHaveBeenCalledWith(
          expect.objectContaining({ type: "application/json" }),
        );
        expect(createElementSpy).toHaveBeenCalledWith("a");
        expect(mockLink.click).toHaveBeenCalled();
        expect(mockLink.remove).toHaveBeenCalled();
        expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
      });

      it("should add .json extension if not present", async () => {
        const mockLink = {
          href: "",
          download: "",
          click: vi.fn(),
          remove: vi.fn(),
        };
        const createElementSpy = vi
          .spyOn(document, "createElement")
          .mockReturnValue(mockLink as unknown as HTMLAnchorElement);
        const jsonData = '{"test": "data"}';
        const blob = new Blob([jsonData], { type: "application/json" });
        blob.text = vi.fn().mockResolvedValue(jsonData);

        await handler.process(blob, "test-data");

        expect(mockLink.download).toBe("test-data.json");
        createElementSpy.mockRestore();
      });
    });
  });

  describe("ExcelFileHandler", () => {
    let handler: ExcelFileHandler;

    beforeEach(() => {
      handler = new ExcelFileHandler();
    });

    describe("canHandle", () => {
      it("should handle Excel MIME types", () => {
        expect(
          handler.canHandle(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          ),
        ).toBe(true);
        expect(handler.canHandle("application/vnd.ms-excel")).toBe(true);
      });

      it('should handle MIME types containing "excel"', () => {
        expect(handler.canHandle("application/excel")).toBe(true);
      });

      it('should handle MIME types containing "spreadsheet"', () => {
        expect(handler.canHandle("application/spreadsheet")).toBe(true);
      });

      it("should not handle other MIME types", () => {
        expect(handler.canHandle("text/csv")).toBe(false);
        expect(handler.canHandle("application/json")).toBe(false);
      });
    });

    describe("process", () => {
      it("should process Excel file and trigger download", async () => {
        const mockLink = {
          href: "",
          download: "",
          click: vi.fn(),
          remove: vi.fn(),
        };
        const createElementSpy = vi
          .spyOn(document, "createElement")
          .mockReturnValue(mockLink as unknown as HTMLAnchorElement);
        const excelData = new ArrayBuffer(8);
        const blob = new Blob([excelData], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        await handler.process(blob, "test-data.xlsx");

        expect(mockCreateObjectURL).toHaveBeenCalledWith(blob);
        expect(createElementSpy).toHaveBeenCalledWith("a");
        expect(mockLink.click).toHaveBeenCalled();
        expect(mockLink.remove).toHaveBeenCalled();
        expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
      });

      it("should add .xlsx extension if not present", async () => {
        const mockLink = {
          href: "",
          download: "",
          click: vi.fn(),
          remove: vi.fn(),
        };
        const createElementSpy = vi
          .spyOn(document, "createElement")
          .mockReturnValue(mockLink as unknown as HTMLAnchorElement);
        const excelData = new ArrayBuffer(8);
        const blob = new Blob([excelData], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        await handler.process(blob, "test-data");

        expect(mockLink.download).toBe("test-data.xlsx");
        createElementSpy.mockRestore();
      });

      it("should not add .xlsx extension if already present", async () => {
        const mockLink = {
          href: "",
          download: "",
          click: vi.fn(),
          remove: vi.fn(),
        };
        const createElementSpy = vi
          .spyOn(document, "createElement")
          .mockReturnValue(mockLink as unknown as HTMLAnchorElement);
        const excelData = new ArrayBuffer(8);
        const blob = new Blob([excelData], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        await handler.process(blob, "test-data.xlsx");

        expect(mockLink.download).toBe("test-data.xlsx");
        createElementSpy.mockRestore();
      });
    });
  });

  describe("fileHandlers array", () => {
    it("should contain all handler instances", () => {
      expect(fileHandlers).toHaveLength(3);
      expect(fileHandlers[0]).toBeInstanceOf(CSVFileHandler);
      expect(fileHandlers[1]).toBeInstanceOf(JSONFileHandler);
      expect(fileHandlers[2]).toBeInstanceOf(ExcelFileHandler);
    });
  });

  describe("getFileHandler", () => {
    it("should return CSV handler for CSV MIME type", () => {
      const handler = getFileHandler("text/csv");
      expect(handler).toBeInstanceOf(CSVFileHandler);
    });

    it("should return JSON handler for JSON MIME type", () => {
      const handler = getFileHandler("application/json");
      expect(handler).toBeInstanceOf(JSONFileHandler);
    });

    it("should return Excel handler for Excel MIME type", () => {
      const handler = getFileHandler(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      expect(handler).toBeInstanceOf(ExcelFileHandler);
    });

    it("should return null for unsupported MIME type", () => {
      const handler = getFileHandler("image/png");
      expect(handler).toBeNull();
    });

    it("should return first matching handler", () => {
      // CSV handler should match text/plain as well
      const handler = getFileHandler("text/plain");
      expect(handler).toBeInstanceOf(CSVFileHandler);
    });
  });
});
