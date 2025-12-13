"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { downloadFile, type DownloadResult } from "@/lib/file-download";
import { cn } from "@/lib/utils";

export type DownloadStatus = "idle" | "downloading" | "success" | "error";

interface DownloadButtonProps {
  url: string;
  filename?: string;
  children?: React.ReactNode;
  onSuccess?: (result: DownloadResult) => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
  resetDelayMs?: number;
}

export function DownloadButton({
  url,
  filename,
  children,
  onSuccess,
  onError,
  className,
  disabled = false,
  resetDelayMs = 3000,
}: DownloadButtonProps) {
  const [status, setStatus] = useState<DownloadStatus>("idle");
  const [progress, setProgress] = useState<number>(0);

  const resetTimeoutRef = useRef<number | null>(null);

  const isDownloading = status === "downloading";

  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) {
        window.clearTimeout(resetTimeoutRef.current);
      }
    };
  }, []);

  const resetStatusLater = useCallback(() => {
    resetTimeoutRef.current = window.setTimeout(() => {
      setStatus("idle");
      setProgress(0);
    }, resetDelayMs);
  }, [resetDelayMs]);

  const handleDownload = useCallback(async () => {
    if (isDownloading || disabled) return;

    setStatus("downloading");
    setProgress(0);

    try {
      const result = await downloadFile(url, filename, (value: number) =>
        setProgress(value),
      );

      if (result.success) {
        setStatus("success");
        toast.success("Download concluído com sucesso");
        onSuccess?.(result);
      } else {
        const message = result.error || "Falha no download";
        setStatus("error");
        toast.error(message);
        onError?.(message);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Falha no download";
      setStatus("error");
      toast.error(message);
      onError?.(message);
    } finally {
      resetStatusLater();
    }
  }, [
    disabled,
    filename,
    isDownloading,
    onError,
    onSuccess,
    resetStatusLater,
    url,
  ]);

  const renderButtonContent = () => {
    switch (status) {
      case "success":
        return (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Concluído
          </>
        );

      case "error":
        return (
          <>
            <AlertCircle className="mr-2 h-4 w-4" />
            Falhou
          </>
        );

      case "downloading":
        return (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Baixando...
          </>
        );

      default:
        return (
          <>
            <Download className="mr-2 h-4 w-4" />
            {children || "Download"}
          </>
        );
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleDownload}
        disabled={disabled || isDownloading}
        className={className}
        variant={
          status === "error"
            ? "destructive"
            : status === "success"
              ? "default"
              : "default"
        }
        aria-busy={isDownloading}
      >
        {renderButtonContent()}
      </Button>

      {isDownloading && progress > 0 && progress < 100 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Baixando…</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress
            value={progress}
            className={cn("h-1 transition-all")}
            aria-label="Progresso do download"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          />
        </div>
      )}
    </div>
  );
}
