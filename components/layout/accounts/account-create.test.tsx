import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

// Add polyfill for scrollIntoView which is needed by Radix Select
Element.prototype.scrollIntoView = vi.fn();

import { AccountForm } from "./account-create";

// Mock hooks
vi.mock("@/hooks/use-mobile");
vi.mock("@/hooks/use-accounts");
vi.mock("@/hooks/use-toast");

describe("AccountForm", () => {
  const mockOnSubmit = vi.fn();
  const mockOnClose = vi.fn();

  const renderComponent = (props = {}) => {
    return render(
      <AccountForm
        onSubmit={mockOnSubmit}
        isLoading={false}
        onClose={mockOnClose}
        {...props}
      />,
    );
  };

  it("renders form fields", () => {
    renderComponent();
    expect(
      screen.getByLabelText(/identificação da conta/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/moeda/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/saldo inicial/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /criar conta/i }),
    ).toBeInTheDocument();
  });

  it("calls onSubmit with valid data", async () => {
    const user = userEvent.setup();
    renderComponent();

    const identificationInput = screen.getByLabelText(
      /identificação da conta/i,
    );
    const initialAmountInput = screen.getByLabelText(/saldo inicial/i);

    await user.type(identificationInput, "Nubank");
    await user.clear(initialAmountInput);
    await user.type(initialAmountInput, "1500.50");

    const submitButton = screen.getByRole("button", { name: /criar conta/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          identification: "Nubank",
          initial_amount: 1500.5,
          currency: "BRL",
          kind: undefined,
        }),
      );
    });
  });

  it("calls onClose when cancel button is clicked", async () => {
    const user = userEvent.setup();
    renderComponent();

    const cancelButton = screen.getByRole("button", { name: /cancelar/i });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("validates required fields", async () => {
    const user = userEvent.setup();
    renderComponent();

    const submitButton = screen.getByRole("button", { name: /criar conta/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(/identificação deve ter pelo menos 2 caracteres/i),
      ).toBeInTheDocument();
    });
  });

  it("shows loading state", () => {
    renderComponent({ isLoading: true });
    expect(
      screen.getByRole("button", { name: /criando conta/i }),
    ).toBeDisabled();
  });
});
