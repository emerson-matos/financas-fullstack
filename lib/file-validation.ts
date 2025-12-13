export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  fileType?: string;
  sizeInMB?: number;
}

export const validateFile = (
  blob: Blob,
  fileName?: string,
): FileValidationResult => {
  const sizeInMB = blob.size / (1024 * 1024);
  const mimeType = blob.type;

  // Check file size (max 100MB)
  if (sizeInMB > 100) {
    return {
      isValid: false,
      error: "File size exceeds 100MB limit",
      sizeInMB,
    };
  }

  // Check file type - use both MIME type and file extension for better mobile compatibility
  const allowedTypes = [
    "text/csv",
    "application/json",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "application/x-ofx",
    "text/plain", // For OFX files that might be detected as text/plain
    "application/octet-stream", // Mobile browsers sometimes use this for unknown files
  ];

  // Get file extension if filename is provided
  const fileExtension = fileName
    ? fileName.toLowerCase().split(".").pop()
    : null;
  const allowedExtensions = ["csv", "json", "pdf", "xlsx", "xls", "ofx"];

  // Check MIME type OR file extension (more permissive for mobile)
  const isValidMimeType = allowedTypes.includes(mimeType);
  const isValidExtension =
    fileExtension && allowedExtensions.includes(fileExtension);

  if (!(isValidMimeType || isValidExtension)) {
    return {
      isValid: false,
      error: "Unsupported file type. Please select a CSV or OFX file.",
      fileType: mimeType,
    };
  }

  return {
    isValid: true,
    fileType: mimeType,
    sizeInMB,
  };
};
