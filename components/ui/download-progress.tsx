"use client";

import { AlertCircle, CheckCircle, X } from "lucide-react";
import { JSX, useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

export type DownloadStatus = "idle" | "downloading" | "success" | "error";

interface DownloadProgressProps {
  progress: number;
  status: DownloadStatus;
  filename?: string;
  error?: string;
  onCancel?: () => void;
  onRetry?: () => void;
}

const containerVariants = cva(
  "rounded-lg border p-3 space-y-2 transition-colors animate-in fade-in slide-in-from-bottom-1",
  {
    variants: {
      status: {
        downloading: "border-muted",
        success: "border-accent/50 bg-accent/5",
        error: "border-destructive/50 bg-destructive/5",
        idle: "hidden",
      },
    },
    defaultVariants: {
      status: "idle",
    },
  },
);

const STATUS_ICON: Record<DownloadStatus, JSX.Element | null> = {
  downloading: null,
  success: <CheckCircle className="h-4 w-4 text-accent-foreground" />,
  error: <AlertCircle className="h-4 w-4 text-destructive" />,
  idle: null,
};

export function DownloadProgress({
  progress,
  status,
  filename,
  error,
  onCancel,
  onRetry,
}: DownloadProgressProps) {
  const statusText = useMemo(() => {
    switch (status) {
      case "downloading":
        return `Baixando... ${Math.round(progress)}%`;
      case "success":
        return "Download concluído";
      case "error":
        return error || "Erro no download";
      default:
        return "";
    }
  }, [status, progress, error]);

  if (status === "idle") return null;
  const displayName = filename?.trim() || "download";

  return (
    <div
      className={containerVariants({ status })}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-foreground truncate">
          {displayName}
        </span>

        <div className="flex items-center gap-2">
          {STATUS_ICON[status]}
          <span className="text-muted-foreground whitespace-nowrap">
            {statusText}
          </span>

          {status === "downloading" && onCancel && (
            <Button
              size="icon"
              variant="ghost"
              onClick={onCancel}
              aria-label="Cancelar download"
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          {status === "error" && onRetry && (
            <Button size="sm" variant="secondary" onClick={onRetry}>
              Tentar novamente
            </Button>
          )}
        </div>
      </div>

      {status === "downloading" && (
        <Progress
          value={progress}
          className={cn("w-full transition-all duration-300")}
          aria-label="Progresso do download"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        />
      )}
    </div>
  );
}

