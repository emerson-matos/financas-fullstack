"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download, CheckCircle, AlertCircle } from "lucide-react";
import { downloadFile, type DownloadResult } from "@/lib/file-download";
import { toast } from "sonner";
interface DownloadButtonProps {
  url: string;
  filename?: string;
  children?: React.ReactNode;
  onSuccess?: (result: DownloadResult) => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
}
export function DownloadButton({
  url,
  filename,
  children,
  onSuccess,
  onError,
  className,
  disabled = false,
}: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<
    "idle" | "downloading" | "success" | "error"
  >("idle");
  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    setProgress(0);
    setStatus("downloading");
    try {
      const result = await downloadFile(url, filename, (progressValue) => {
        setProgress(progressValue);
      });
      if (result.success) {
        setStatus("success");
        toast.success("Download completed successfully");
        onSuccess?.(result);
      } else {
        setStatus("error");
        toast.error(result.error || "Download failed");
        onError?.(result.error || "Download failed");
      }
    } catch (error: any) {
      setStatus("error");
      const errorMessage = error.message || "Download failed";
      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsDownloading(false);
      // Reset status after a delay
      setTimeout(() => setStatus("idle"), 3000);
    }
  };
  const getButtonContent = () => {
    if (status === "success") {
      return (
        <>
          <CheckCircle className="mr-2 h-4 w-4" />
          Downloaded
        </>
      );
    }
    if (status === "error") {
      return (
        <>
          <AlertCircle className="mr-2 h-4 w-4" />
          Failed
        </>
      );
    }
    if (isDownloading) {
      return (
        <>
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Downloading...
        </>
      );
    }
    return (
      <>
        <Download className="mr-2 h-4 w-4" />
        {children || "Download"}
      </>
    );
  };
  return (
    <div className="space-y-2">
      <Button
        onClick={handleDownload}
        disabled={disabled || isDownloading}
        className={className}
        variant={
          status === "success"
            ? "default"
            : status === "error"
              ? "destructive"
              : "default"
        }
      >
        {getButtonContent()}
      </Button>
      {isDownloading && progress > 0 && progress < 100 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Downloading...</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1" />
        </div>
      )}
    </div>
  );
}

