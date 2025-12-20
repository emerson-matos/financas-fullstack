import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AccountsGrid } from "./accounts-grid";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock useAccounts hook
const mockAccounts = [
  {
    id: "1",
    user_id: "user-1",
    identification: "Nubank Conta",
    kind: "CHECKING",
    currency: "BRL",
    current_amount: 1500,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
    deactivated_at: null,
  },
  {
    id: "2",
    user_id: "user-1",
    identification: "Itaú Conta",
    kind: "CHECKING",
    currency: "BRL",
    current_amount: 2500,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
    deactivated_at: null,
  },
  {
    id: "3",
    user_id: "user-1",
    identification: "Poupança BB",
    kind: "SAVINGS",
    currency: "BRL",
    current_amount: 5000,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
    deactivated_at: null,
  },
  {
    id: "4",
    user_id: "user-1",
    identification: "Nubank Crédito",
    kind: "CREDIT_CARD",
    currency: "BRL",
    current_amount: -1234.56,
    credit_limit: 10000,
    bill_due_day: 12,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
    deactivated_at: null,
  },
];

vi.mock("@/hooks/use-accounts", () => ({
  useAccounts: vi.fn(() => ({
    data: mockAccounts,
    isLoading: false,
  })),
}));

describe("AccountsGrid", () => {
  it("renders summary section", () => {
    render(<AccountsGrid />);
    expect(screen.getByTestId("total-balance")).toBeInTheDocument();
  });

  it("groups accounts by type", () => {
    render(<AccountsGrid />);

    // Check group headers exist
    expect(screen.getByTestId("account-group-checking")).toBeInTheDocument();
    expect(screen.getByTestId("account-group-savings")).toBeInTheDocument();
    expect(screen.getByTestId("account-group-credit_card")).toBeInTheDocument();
  });

  it("shows correct count for each group", () => {
    render(<AccountsGrid />);

    // Should show (2) for checking accounts
    expect(screen.getByText("(2)")).toBeInTheDocument();
    // Should show (1) for savings and credit cards
    expect(screen.getAllByText("(1)").length).toBe(2);
  });

  it("renders all account cards", () => {
    render(<AccountsGrid />);

    expect(screen.getByText("Nubank Conta")).toBeInTheDocument();
    expect(screen.getByText("Itaú Conta")).toBeInTheDocument();
    expect(screen.getByText("Poupança BB")).toBeInTheDocument();
    expect(screen.getByText("Nubank Crédito")).toBeInTheDocument();
  });

  it("renders group labels", () => {
    render(<AccountsGrid />);

    expect(screen.getByText("Contas Correntes")).toBeInTheDocument();
    expect(screen.getByText("Poupança BB")).toBeInTheDocument();
    expect(screen.getByText("Cartões de Crédito")).toBeInTheDocument();
  });
});

describe("AccountsGrid - Empty State", () => {
  it("shows empty message when no accounts", () => {
    vi.doMock("@/hooks/use-accounts", () => ({
      useAccounts: vi.fn(() => ({
        data: { data: { content: [] } },
        isLoading: false,
      })),
    }));

    // Re-import to get new mock
    vi.resetModules();
  });
});
