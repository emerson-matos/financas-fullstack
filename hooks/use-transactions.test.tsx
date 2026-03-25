import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTransactions, useTransaction, useCreateTransaction } from "./use-transactions";
import { transactionService } from "@/lib/services/transactions";

vi.mock("@/lib/services/transactions", () => ({
  transactionService: {
    getTransactions: vi.fn(),
    getTransaction: vi.fn(),
    createTransaction: vi.fn(),
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

describe("useTransactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch transactions", async () => {
    const mockData = {
      content: [{ id: "tx-1", name: "Test" }],
      totalElements: 1,
      totalPages: 1,
    };
    vi.mocked(transactionService.getTransactions).mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useTransactions(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(transactionService.getTransactions).toHaveBeenCalledWith(
      expect.objectContaining({
        sort: ["transacted_at,desc"],
      })
    );
    expect(result.current.data).toEqual([{ id: "tx-1", name: "Test" }]);
  });

  it("should fetch transactions with custom params", async () => {
    const mockData = {
      content: [],
      totalElements: 0,
      totalPages: 0,
    };
    vi.mocked(transactionService.getTransactions).mockResolvedValueOnce(mockData);

    const { result } = renderHook(
      () => useTransactions({ search: "groceries", size: 20 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(transactionService.getTransactions).toHaveBeenCalledWith(
      expect.objectContaining({
        search: "groceries",
        size: 20,
        sort: ["transacted_at,desc"],
      })
    );
  });
});

describe("useTransaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch single transaction", async () => {
    const mockData = { id: "tx-123", name: "Test Transaction" };
    vi.mocked(transactionService.getTransaction).mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useTransaction("tx-123"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(transactionService.getTransaction).toHaveBeenCalledWith("tx-123");
    expect(result.current.data).toEqual(mockData);
  });

  it("should not fetch when id is empty", async () => {
    const { result } = renderHook(() => useTransaction(""), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFetching).toBe(false);
    expect(transactionService.getTransaction).not.toHaveBeenCalled();
  });
});

describe("useCreateTransaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create transaction and invalidate queries", async () => {
    const mockData = { id: "tx-new", name: "New Transaction" };
    vi.mocked(transactionService.createTransaction).mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useCreateTransaction(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      name: "New Transaction",
      description: "Test",
      amount: 100,
      kind: "DEBIT",
      transactedAt: "2024-01-01",
      currency: "BRL",
      accountId: "acc-1",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(transactionService.createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "New Transaction",
        amount: 100,
      })
    );
  });

  it("should handle error on create failure", async () => {
    const error = new Error("Failed to create");
    vi.mocked(transactionService.createTransaction).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useCreateTransaction(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      name: "New Transaction",
      description: "Test",
      amount: 100,
      kind: "DEBIT",
      transactedAt: "2024-01-01",
      currency: "BRL",
      accountId: "acc-1",
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(transactionService.createTransaction).toHaveBeenCalled();
  });
});