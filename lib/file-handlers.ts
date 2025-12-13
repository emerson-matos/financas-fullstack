export interface FileHandler {
  canHandle: (mimeType: string) => boolean;
  process: (blob: Blob, filename: string) => Promise<void>;
}

export class CSVFileHandler implements FileHandler {
  canHandle(mimeType: string): boolean {
    return mimeType.includes("csv") || mimeType.includes("text/plain");
  }

  async process(blob: Blob, filename: string): Promise<void> {
    const text = await blob.text();
    const downloadUrl = window.URL.createObjectURL(
      new Blob([text], { type: "text/csv" }),
    );
    this.triggerDownload(downloadUrl, filename);
  }

  private triggerDownload(url: string, filename: string): void {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
}

export class JSONFileHandler implements FileHandler {
  canHandle(mimeType: string): boolean {
    return mimeType.includes("json");
  }

  async process(blob: Blob, filename: string): Promise<void> {
    const text = await blob.text();
    const downloadUrl = window.URL.createObjectURL(
      new Blob([text], { type: "application/json" }),
    );
    this.triggerDownload(downloadUrl, filename);
  }

  private triggerDownload(url: string, filename: string): void {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename.endsWith(".json") ? filename : `${filename}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
}

export class ExcelFileHandler implements FileHandler {
  canHandle(mimeType: string): boolean {
    return mimeType.includes("excel") || mimeType.includes("spreadsheet");
  }

  process(blob: Blob, filename: string): Promise<void> {
    const downloadUrl = window.URL.createObjectURL(blob);
    this.triggerDownload(downloadUrl, filename);
    return Promise.resolve();
  }

  private triggerDownload(url: string, filename: string): void {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }
}

export const fileHandlers: Array<FileHandler> = [
  new CSVFileHandler(),
  new JSONFileHandler(),
  new ExcelFileHandler(),
];

export const getFileHandler = (mimeType: string): FileHandler | null => {
  return fileHandlers.find((handler) => handler.canHandle(mimeType)) || null;
};
