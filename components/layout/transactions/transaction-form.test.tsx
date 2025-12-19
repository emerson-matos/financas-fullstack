import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useAccounts } from "@/hooks/use-accounts";
import { useCategories } from "@/hooks/use-categories";
import { useToast } from "@/hooks/use-toast";
import {
  useCreateTransaction,
  useTransaction,
  useUpdateTransaction,
} from "@/hooks/use-transactions";
import type { Account, Category, Transaction } from "@/lib/types";
import { TransactionForm } from "./transaction-form";

vi.mock("@/hooks/use-toast");
vi.mock("@/hooks/use-transactions");
vi.mock("@/hooks/use-accounts");
vi.mock("@/hooks/use-categories");

describe("TransactionForm", () => {
  const mockAccounts = [
    { id: "1", identification: "Account 1" },
    { id: "2", identification: "Account 2" },
  ];
  const mockCategories = [
    { id: "1", name: "Category 1" },
    { id: "2", name: "Category 2" },
  ];
  const mockTransaction: Transaction = {
    id: "1",
    account_id: "1",
    category_id: "1",
    amount: 100,
    description: "Test Transaction",
    transacted_date: new Date("2023-01-01"),
    kind: "DEBIT" as const,
    user_id: "1",
    deactivated_at: null,
    created_at: new Date("2023-01-01"),
    updated_at: new Date("2023-01-01"),
  };
  const mockMutate = vi.fn();
  beforeEach(() => {
    vi.clearAllMocks();
    (useToast as ReturnType<typeof vi.fn>).mockReturnValue({
      toast: vi.fn(),
    });
    (useAccounts as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockAccounts as Array<Account>,
      isLoading: false,
    });
    (useCategories as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockCategories as Array<Category>,
      isLoading: false,
    });
    (useTransaction as ReturnType<typeof vi.fn>).mockReturnValue({
      data: mockTransaction as Transaction,
      isLoading: false,
    });
    (useCreateTransaction as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
    (useUpdateTransaction as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });
  it("renders the form with initial values", () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <TransactionForm />
      </QueryClientProvider>,
    );
    expect(screen.getByLabelText(/nome/i)).toBeTruthy();
    expect(screen.getByLabelText(/conta/i)).toBeTruthy();
    expect(screen.getByLabelText(/categoria/i)).toBeTruthy();
    expect(screen.getByLabelText(/valor/i)).toBeTruthy();
    expect(screen.getByLabelText(/descrição/i)).toBeTruthy();
    expect(screen.getByLabelText(/data da transação/i)).toBeTruthy();
    expect(screen.getByText(/tipo de transação/i)).toBeTruthy();
  });
});
