import { describe, expect, it } from "vitest";

import { validateFile } from "./file-validation";

describe("validateFile", () => {
  describe("file size validation", () => {
    it("should accept files under 100MB", () => {
      const blob = new Blob(["test data"], { type: "text/csv" });
      // Mock size to be under 100MB (1MB)
      Object.defineProperty(blob, "size", { value: 1024 * 1024 });

      const result = validateFile(blob, "test.csv");

      expect(result.isValid).toBe(true);
      expect(result.fileType).toBe("text/csv");
      expect(result.sizeInMB).toBe(1);
      expect(result.error).toBeUndefined();
    });

    it("should reject files over 100MB", () => {
      const blob = new Blob(["test data"], { type: "text/csv" });
      // Mock size to be over 100MB (150MB)
      Object.defineProperty(blob, "size", { value: 150 * 1024 * 1024 });

      const result = validateFile(blob, "large.csv");

      expect(result.isValid).toBe(false);
      expect(result.error).toBe("File size exceeds 100MB limit");
      expect(result.sizeInMB).toBe(150);
    });

    it("should handle exactly 100MB files", () => {
      const blob = new Blob(["test data"], { type: "text/csv" });
      // Mock size to be exactly 100MB
      Object.defineProperty(blob, "size", { value: 100 * 1024 * 1024 });

      const result = validateFile(blob, "exactly100mb.csv");

      expect(result.isValid).toBe(true);
      expect(result.sizeInMB).toBe(100);
    });
  });

  describe("file type validation", () => {
    it("should accept CSV files", () => {
      const blob = new Blob(["test data"], { type: "text/csv" });
      Object.defineProperty(blob, "size", { value: 1024 });

      const result = validateFile(blob, "test.csv");

      expect(result.isValid).toBe(true);
      expect(result.fileType).toBe("text/csv");
    });

    it("should accept JSON files", () => {
      const blob = new Blob(['{"test": "data"}'], { type: "application/json" });
      Object.defineProperty(blob, "size", { value: 1024 });

      const result = validateFile(blob, "test.json");

      expect(result.isValid).toBe(true);
      expect(result.fileType).toBe("application/json");
    });

    it("should accept PDF files", () => {
      const blob = new Blob(["pdf data"], { type: "application/pdf" });
      Object.defineProperty(blob, "size", { value: 1024 });

      const result = validateFile(blob, "test.pdf");

      expect(result.isValid).toBe(true);
      expect(result.fileType).toBe("application/pdf");
    });

    it("should accept Excel files (XLSX)", () => {
      const blob = new Blob(["excel data"], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      Object.defineProperty(blob, "size", { value: 1024 });

      const result = validateFile(blob, "test.xlsx");

      expect(result.isValid).toBe(true);
      expect(result.fileType).toBe(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
    });

    it("should accept Excel files (XLS)", () => {
      const blob = new Blob(["excel data"], {
        type: "application/vnd.ms-excel",
      });
      Object.defineProperty(blob, "size", { value: 1024 });

      const result = validateFile(blob, "test.xls");

      expect(result.isValid).toBe(true);
      expect(result.fileType).toBe("application/vnd.ms-excel");
    });

    it("should reject unsupported file types", () => {
      const blob = new Blob(["image data"], { type: "image/png" });
      Object.defineProperty(blob, "size", { value: 1024 });

      const result = validateFile(blob, "image.png");

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "Unsupported file type. Please select a CSV or OFX file.",
      );
      expect(result.fileType).toBe("image/png");
    });

    it("should reject files with no MIME type", () => {
      const blob = new Blob(["unknown data"], { type: "" });
      Object.defineProperty(blob, "size", { value: 1024 });

      const result = validateFile(blob, "unknown.txt");

      expect(result.isValid).toBe(false);
      expect(result.error).toBe(
        "Unsupported file type. Please select a CSV or OFX file.",
      );
    });

    it("should accept OFX files with application/x-ofx MIME type", () => {
      const blob = new Blob(["OFXHEADER:100"], { type: "application/x-ofx" });
      Object.defineProperty(blob, "size", { value: 1024 });

      const result = validateFile(blob, "bank-data.ofx");

      expect(result.isValid).toBe(true);
      expect(result.fileType).toBe("application/x-ofx");
    });

    it("should accept OFX files with unknown MIME type but valid extension", () => {
      const blob = new Blob(["OFXHEADER:100"], {
        type: "application/octet-stream",
      });
      Object.defineProperty(blob, "size", { value: 1024 });

      const result = validateFile(blob, "bank-data.ofx");

      expect(result.isValid).toBe(true);
      expect(result.fileType).toBe("application/octet-stream");
    });

    it("should accept CSV files with unknown MIME type but valid extension", () => {
      const blob = new Blob(["date,amount,description"], {
        type: "application/octet-stream",
      });
      Object.defineProperty(blob, "size", { value: 1024 });

      const result = validateFile(blob, "transactions.csv");

      expect(result.isValid).toBe(true);
      expect(result.fileType).toBe("application/octet-stream");
    });
  });

  describe("edge cases", () => {
    it("should handle zero-sized files", () => {
      const blob = new Blob([], { type: "text/csv" });
      Object.defineProperty(blob, "size", { value: 0 });

      const result = validateFile(blob, "empty.csv");

      expect(result.isValid).toBe(true);
      expect(result.sizeInMB).toBe(0);
    });

    it("should handle very small files", () => {
      const blob = new Blob(["a"], { type: "text/csv" });
      Object.defineProperty(blob, "size", { value: 1 });

      const result = validateFile(blob, "small.csv");

      expect(result.isValid).toBe(true);
      expect(result.sizeInMB).toBeCloseTo(0.00000095, 8);
    });
  });
});
