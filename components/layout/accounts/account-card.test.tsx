import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AccountCard, formatCurrency } from "./account-card";
import type { Account } from "@/lib/types";

const mockCheckingAccount: Account = {
  id: "1",
  user_id: "user-1",
  identification: "Nubank Conta",
  kind: "CHECKING",
  currency: "BRL",
  current_amount: 1500.5,
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
  deactivated_at: null,
};

const mockCreditCardAccount: Account = {
  id: "2",
  user_id: "user-1",
  identification: "Nubank Crédito",
  kind: "CREDIT_CARD",
  currency: "BRL",
  current_amount: -1234.56,
  credit_limit: 10000,
  bill_closing_day: 5,
  bill_due_day: 12,
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
  deactivated_at: null,
};

const mockSavingsAccount: Account = {
  id: "3",
  user_id: "user-1",
  identification: "Poupança BB",
  kind: "SAVINGS",
  currency: "BRL",
  current_amount: 5000,
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
  deactivated_at: null,
};

describe("AccountCard", () => {
  describe("formatCurrency", () => {
    it("formats BRL currency correctly", () => {
      expect(formatCurrency(1234.56, "BRL")).toBe("R$ 1.234,56");
    });

    it("formats USD currency correctly", () => {
      expect(formatCurrency(1234.56, "USD")).toBe("US$ 1.234,56");
    });

    it("formats negative amounts", () => {
      expect(formatCurrency(-1234.56, "BRL")).toBe("-R$ 1.234,56");
    });
  });

  describe("Checking Account", () => {
    it("renders account name", () => {
      render(<AccountCard account={mockCheckingAccount} />);
      expect(screen.getByText("Nubank Conta")).toBeInTheDocument();
    });

    it("renders account type badge", () => {
      render(<AccountCard account={mockCheckingAccount} />);
      expect(screen.getByText("Conta Corrente")).toBeInTheDocument();
    });

    it("renders positive balance in green", () => {
      render(<AccountCard account={mockCheckingAccount} />);
      const balance = screen.getByTestId("account-balance");
      expect(balance).toHaveTextContent("R$ 1.500,50");
      expect(balance).toHaveClass("text-emerald-600");
    });

    it("calls onClick when clicked", () => {
      const handleClick = vi.fn();
      render(
        <AccountCard account={mockCheckingAccount} onClick={handleClick} />,
      );

      const card = screen.getByTestId("account-card-1");
      fireEvent.click(card);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("Credit Card Account", () => {
    it("renders credit card specific info", () => {
      render(<AccountCard account={mockCreditCardAccount} />);

      expect(screen.getByText("Cartão de Crédito")).toBeInTheDocument();
      expect(screen.getByText(/Limite:/)).toBeInTheDocument();
      expect(screen.getByText(/Venc: dia 12/)).toBeInTheDocument();
    });

    it("renders negative balance in red", () => {
      render(<AccountCard account={mockCreditCardAccount} />);
      const balance = screen.getByTestId("account-balance");
      expect(balance).toHaveTextContent("-R$ 1.234,56");
      expect(balance).toHaveClass("text-red-600");
    });
  });

  describe("Savings Account", () => {
    it("renders savings account with correct badge", () => {
      render(<AccountCard account={mockSavingsAccount} />);
      expect(screen.getByText("Poupança")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper test id for automation", () => {
      render(<AccountCard account={mockCheckingAccount} />);
      expect(screen.getByTestId("account-card-1")).toBeInTheDocument();
    });

    it("has title attribute for truncated names", () => {
      const longNameAccount = {
        ...mockCheckingAccount,
        identification: "Very Long Account Name That Might Be Truncated",
      };
      render(<AccountCard account={longNameAccount} />);
      expect(
        screen.getByTitle("Very Long Account Name That Might Be Truncated"),
      ).toBeInTheDocument();
    });
  });
});
