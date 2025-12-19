import { renderHook } from "@testing-library/react";
import { toast as sonnerToast } from "sonner";
import { vi, describe, it, expect, beforeEach } from "vitest";

import { useToast } from "./use-toast";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    dismiss: vi.fn(),
    promise: vi.fn(),
    loading: vi.fn(),
  },
}));

describe("useToast", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call sonner toast with correct parameters for success variant", () => {
    const { result } = renderHook(() => useToast());

    result.current.toast({
      title: "Success",
      description: "Operation completed",
    });

    expect(sonnerToast.success).toHaveBeenCalledWith("Success", {
      description: "Operation completed",
      duration: 4000,
      position: "bottom-right",
    });
  });

  it("should call sonner toast with correct parameters for destructive variant", () => {
    const { result } = renderHook(() => useToast());

    result.current.toast({
      title: "Error",
      description: "Something went wrong",
      variant: "destructive",
    });

    expect(sonnerToast.error).toHaveBeenCalledWith("Error", {
      description: "Something went wrong",
      duration: 4000,
      position: "bottom-right",
    });
  });

  it("should call sonner toast with correct parameters for info variant", () => {
    const { result } = renderHook(() => useToast());

    result.current.toast({
      title: "Info",
      description: "Here's some information",
      variant: "info",
    });

    expect(sonnerToast.info).toHaveBeenCalledWith("Info", {
      description: "Here's some information",
      duration: 4000,
      position: "bottom-right",
    });
  });

  it("should call sonner toast with correct parameters for warning variant", () => {
    const { result } = renderHook(() => useToast());

    result.current.toast({
      title: "Warning",
      description: "Be careful",
      variant: "warning",
    });

    expect(sonnerToast.warning).toHaveBeenCalledWith("Warning", {
      description: "Be careful",
      duration: 4000,
      position: "bottom-right",
    });
  });

  it("should handle custom options", () => {
    const { result } = renderHook(() => useToast());

    result.current.toast({
      title: "Custom",
      description: "With custom options",
      options: {
        duration: 5000,
        position: "top-center",
        action: {
          label: "Click me",
          onClick: vi.fn(),
        },
      },
    });

    expect(sonnerToast.success).toHaveBeenCalledWith("Custom", {
      description: "With custom options",
      duration: 5000,
      position: "top-center",
      action: {
        label: "Click me",
        onClick: expect.any(Function),
      },
    });
  });

  it("should expose dismiss method", () => {
    const { result } = renderHook(() => useToast());

    result.current.dismiss("toast-id");

    expect(sonnerToast.dismiss).toHaveBeenCalledWith("toast-id");
  });

  it("should expose loading method", () => {
    const { result } = renderHook(() => useToast());

    result.current.loading("Loading...");

    expect(sonnerToast.loading).toHaveBeenCalledWith("Loading...");
  });
});
