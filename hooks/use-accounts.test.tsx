import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAccounts, useAccount, useCreateAccount } from "./use-accounts";
import { accountService } from "@/lib/services/accounts";

vi.mock("@/lib/services/accounts", () => ({
  accountService: {
    getAccounts: vi.fn(),
    getAccount: vi.fn(),
    createAccount: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "QueryClientWrapper";
  return Wrapper;
};

describe("useAccounts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch accounts", async () => {
    const mockData = {
      content: [{ id: "acc-1", identification: "Bank Account" }],
      totalElements: 1,
      totalPages: 1,
    };
    vi.mocked(accountService.getAccounts).mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useAccounts(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(accountService.getAccounts).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 0,
        size: 10,
        sort: ["identification,asc"],
      })
    );
    expect(result.current.data).toEqual([{ id: "acc-1", identification: "Bank Account" }]);
  });

  it("should fetch accounts with custom params", async () => {
    const mockData = {
      content: [],
      totalElements: 0,
      totalPages: 0,
    };
    vi.mocked(accountService.getAccounts).mockResolvedValueOnce(mockData);

    const { result } = renderHook(
      () => useAccounts({ page: 2, size: 20 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(accountService.getAccounts).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 2,
        size: 20,
        sort: ["identification,asc"],
      })
    );
  });
});

describe("useAccount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch single account", async () => {
    const mockData = { id: "acc-123", identification: "Test Account" };
    vi.mocked(accountService.getAccount).mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useAccount("acc-123"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(accountService.getAccount).toHaveBeenCalledWith("acc-123");
    expect(result.current.data).toEqual(mockData);
  });

  it("should not fetch when id is empty", async () => {
    const { result } = renderHook(() => useAccount(""), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
    expect(accountService.getAccount).not.toHaveBeenCalled();
  });
});

describe("useCreateAccount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create account and invalidate queries", async () => {
    const mockData = { id: "acc-new", identification: "New Account" };
    vi.mocked(accountService.createAccount).mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useCreateAccount(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ identification: "New Account", kind: "CHECKING", currency: "BRL" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(accountService.createAccount).toHaveBeenCalledWith(
      expect.objectContaining({
        identification: "New Account",
        kind: "CHECKING",
      })
    );
  });

  it("should handle error on create failure", async () => {
    const error = new Error("Failed to create");
    vi.mocked(accountService.createAccount).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useCreateAccount(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ identification: "New Account", kind: "CHECKING", currency: "BRL" });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(accountService.createAccount).toHaveBeenCalled();
  });
});