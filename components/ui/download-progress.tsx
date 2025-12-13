import { AlertCircle, CheckCircle, X } from "lucide-react";
import type React from "react";
import { Progress } from "./progress";
interface DownloadProgressProps {
  progress: number;
  status: "idle" | "downloading" | "success" | "error";
  filename?: string;
  error?: string;
}
export const DownloadProgress: React.FC<DownloadProgressProps> = ({
  progress,
  status,
  filename,
  error,
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-accent-foreground" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case "idle":
        return <X className="h-4 w-4 text-muted-foreground" />;
      default:
        return null;
    }
  };
  const getStatusText = () => {
    switch (status) {
      case "downloading":
        return `Baixando... ${Math.round(progress)}%`;
      case "success":
        return "Download concluído";
      case "error":
        return error || "Erro no download";
      case "idle":
        return "Pronto para download";
      default:
        return "";
    }
  };
  if (status === "idle") return null;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">
          {filename || "download"}
        </span>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-muted-foreground">{getStatusText()}</span>
        </div>
      </div>
      {status === "downloading" && (
        <Progress value={progress} className="w-full" />
      )}
    </div>
  );
}; 