import type { ReactNode } from "react";
import { toast as sonnerToast, type ToastT } from "sonner";

type ToastVariant = "default" | "destructive" | "info" | "warning";

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastOptions {
  duration?: number;
  position?: ToastT["position"];
  action?: ToastAction;
}

interface ToastProps {
  title?: ReactNode;
  description?: ReactNode;
  variant?: ToastVariant;
  options?: ToastOptions;
}

function toast({
  title,
  description,
  variant = "default",
  options,
}: ToastProps) {
  const toastOptions = {
    duration: options?.duration ?? 4000,
    position: options?.position ?? "bottom-right",
    ...(options?.action && {
      action: {
        label: options.action.label,
        onClick: options.action.onClick,
      },
    }),
  };

  switch (variant) {
    case "destructive":
      return sonnerToast.error(title, {
        description,
        ...toastOptions,
      });
    case "info":
      return sonnerToast.info(title, {
        description,
        ...toastOptions,
      });
    case "warning":
      return sonnerToast.warning(title, {
        description,
        ...toastOptions,
      });
    default:
      return sonnerToast.success(title, {
        description,
        ...toastOptions,
      });
  }
}

function useToast() {
  return {
    toast,
    dismiss: sonnerToast.dismiss,
    loading: sonnerToast.loading,
  };
}

export { useToast, type ToastProps };
