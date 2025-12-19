import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Add polyfill for scrollIntoView which is needed by Radix Select
Element.prototype.scrollIntoView = vi.fn();
import { useCreateAccount } from "@/hooks/use-accounts";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { CreateAccount } from "./account-create";
// Mock hooks
vi.mock("@/hooks/use-mobile");
vi.mock("@/hooks/use-accounts");
vi.mock("@/hooks/use-toast");
describe("CreateAccount", () => {
  const mockMutateAsync = vi.fn();
  const mockToast = vi.fn();
  const createQueryClient = () =>
    new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  const renderComponent = (isMobile = false) => {
    (useIsMobile as ReturnType<typeof vi.fn>).mockReturnValue(isMobile);
    return render(
      <QueryClientProvider client={createQueryClient()}>
        <CreateAccount />
      </QueryClientProvider>,
    );
  };
  beforeEach(() => {
    vi.clearAllMocks();
    (useToast as ReturnType<typeof vi.fn>).mockReturnValue({
      toast: mockToast,
    });
    (useCreateAccount as ReturnType<typeof vi.fn>).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
    });
  });
  describe("Desktop version", () => {
    it("renders dialog trigger button on desktop", () => {
      renderComponent(false);
      const button = screen.getByRole("button", { name: /nova conta/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("Nova Conta");
    });
    it("opens dialog when trigger is clicked", async () => {
      const user = userEvent.setup();
      renderComponent(false);
      const button = screen.getByRole("button", { name: /nova conta/i });
      await user.click(button);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Criar Nova Conta")).toBeInTheDocument();
      expect(
        screen.getByText("Adicione uma nova conta financeira ao seu portfólio"),
      ).toBeInTheDocument();
    });
    it("renders form fields in dialog", async () => {
      const user = userEvent.setup();
      renderComponent(false);
      const button = screen.getByRole("button", { name: /nova conta/i });
      await user.click(button);
      expect(
        screen.getByLabelText(/identificação da conta/i),
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/moeda/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/saldo inicial/i)).toBeInTheDocument();
    });
  });
  describe("Mobile version", () => {
    it("renders drawer trigger button on mobile", () => {
      renderComponent(true);
      const button = screen.getByRole("button", { name: /nova conta/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("Nova Conta");
    });
    it("renders smaller button size on mobile", () => {
      renderComponent(true);
      const button = screen.getByRole("button", { name: /nova conta/i });
      expect(button).toHaveClass("h-9"); // size="sm" results in h-9 class
    });
  });
  describe("Form functionality", () => {
    it("submits form with valid data", async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValueOnce({});
      renderComponent(false);
      // Open dialog
      const triggerButton = screen.getByRole("button", { name: /nova conta/i });
      await user.click(triggerButton);
      // Fill form
      const identificationInput = screen.getByLabelText(
        /identificação da conta/i,
      );
      const initialAmountInput = screen.getByLabelText(/saldo inicial/i);
      await user.type(identificationInput, "Nubank");
      await user.clear(initialAmountInput);
      await user.type(initialAmountInput, "1500.50");
      // Currency defaults to BRL, so we don't need to change it
      // Submit form
      const submitButton = screen.getByRole("button", { name: /criar conta/i });
      await user.click(submitButton);
      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            identification: "Nubank",
            initial_amount: 1500.5,
            currency: "BRL",
            kind: "",
          }),
        );
      });
    });
    it("allows negative initial amounts", async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValueOnce({});
      renderComponent(false);
      // Open dialog
      const triggerButton = screen.getByRole("button", { name: /nova conta/i });
      await user.click(triggerButton);
      // Fill form with negative amount (credit card debt)
      const identificationInput = screen.getByLabelText(
        /identificação da conta/i,
      );
      const initialAmountInput = screen.getByLabelText(/saldo inicial/i);
      await user.type(identificationInput, "Cartão de Crédito");
      await user.clear(initialAmountInput);
      // Use fireEvent for negative numbers as userEvent may have issues
      fireEvent.change(initialAmountInput, { target: { value: "-2500.75" } });
      // Submit form
      const submitButton = screen.getByRole("button", { name: /criar conta/i });
      await user.click(submitButton);
      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            identification: "Cartão de Crédito",
            initial_amount: -2500.75,
            currency: "BRL",
            kind: "",
          }),
        );
      });
    });
    it("shows success toast after successful submission", async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValueOnce({});
      renderComponent(false);
      // Open dialog and fill form
      const triggerButton = screen.getByRole("button", { name: /nova conta/i });
      await user.click(triggerButton);
      const identificationInput = screen.getByLabelText(
        /identificação da conta/i,
      );
      await user.type(identificationInput, "Test Account");
      const submitButton = screen.getByRole("button", { name: /criar conta/i });
      await user.click(submitButton);
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Conta criada com sucesso!",
          description:
            'A conta "Test Account" foi criada e já está disponível.',
        });
      });
    });
    it("shows error toast when submission fails", async () => {
      const user = userEvent.setup();
      // Reset the mock to return a rejection
      (useCreateAccount as ReturnType<typeof vi.fn>).mockReturnValue({
        mutateAsync: vi.fn().mockRejectedValueOnce(new Error("Network error")),
        isPending: false,
      });
      renderComponent(false);
      // Open dialog and fill form
      const triggerButton = screen.getByRole("button", { name: /nova conta/i });
      await user.click(triggerButton);
      const identificationInput = screen.getByLabelText(
        /identificação da conta/i,
      );
      await user.type(identificationInput, "Test Account");
      const submitButton = screen.getByRole("button", { name: /criar conta/i });
      await user.click(submitButton);
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Erro ao criar conta",
          description: "Não foi possível criar a conta. Tente novamente.",
          variant: "destructive",
        });
      });
    });
    it("shows loading state during submission", async () => {
      const user = userEvent.setup();
      // Mock pending state
      (useCreateAccount as ReturnType<typeof vi.fn>).mockReturnValue({
        mutateAsync: mockMutateAsync,
        isPending: true,
      });
      renderComponent(false);
      // Open dialog
      const triggerButton = screen.getByRole("button", { name: /nova conta/i });
      await user.click(triggerButton);
      const submitButton = screen.getByRole("button", {
        name: /criando conta/i,
      });
      expect(submitButton).toBeDisabled();
      expect(screen.getByText("Criando conta...")).toBeInTheDocument();
    });
    it("validates required fields", async () => {
      const user = userEvent.setup();
      renderComponent(false);
      // Open dialog
      const triggerButton = screen.getByRole("button", { name: /nova conta/i });
      await user.click(triggerButton);
      // Try to submit without filling required fields
      const submitButton = screen.getByRole("button", { name: /criar conta/i });
      await user.click(submitButton);
      // Check for validation errors
      await waitFor(() => {
        expect(
          screen.getByText(/identificação deve ter pelo menos 2 caracteres/i),
        ).toBeInTheDocument();
      });
    });
    it("validates identification field length", async () => {
      const user = userEvent.setup();
      renderComponent(false);
      // Open dialog
      const triggerButton = screen.getByRole("button", { name: /nova conta/i });
      await user.click(triggerButton);
      // Enter single character (invalid)
      const identificationInput = screen.getByLabelText(
        /identificação da conta/i,
      );
      await user.type(identificationInput, "A");
      const submitButton = screen.getByRole("button", { name: /criar conta/i });
      await user.click(submitButton);
      await waitFor(() => {
        expect(
          screen.getByText(/identificação deve ter pelo menos 2 caracteres/i),
        ).toBeInTheDocument();
      });
    });
    it("renders currency selector", async () => {
      const user = userEvent.setup();
      renderComponent(false);
      // Open dialog
      const triggerButton = screen.getByRole("button", { name: /nova conta/i });
      await user.click(triggerButton);
      // Check that currency selector is present
      const currencySelect = screen.getByRole("combobox", { name: /moeda/i });
      expect(currencySelect).toBeInTheDocument();
    });
    it("handles decimal amounts correctly", async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValueOnce({});
      renderComponent(false);
      // Open dialog
      const triggerButton = screen.getByRole("button", { name: /nova conta/i });
      await user.click(triggerButton);
      // Fill form with decimal amount
      const identificationInput = screen.getByLabelText(
        /identificação da conta/i,
      );
      const initialAmountInput = screen.getByLabelText(/saldo inicial/i);
      await user.type(identificationInput, "Savings");
      await user.clear(initialAmountInput);
      await user.type(initialAmountInput, "123.45");
      // Submit form
      const submitButton = screen.getByRole("button", { name: /criar conta/i });
      await user.click(submitButton);
      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            identification: "Savings",
            initial_amount: 123.45,
            currency: "BRL",
            kind: "",
          }),
        );
      });
    });
    it("closes dialog after successful submission", async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValueOnce({});
      renderComponent(false);
      // Open dialog
      const triggerButton = screen.getByRole("button", { name: /nova conta/i });
      await user.click(triggerButton);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      // Fill and submit form
      const identificationInput = screen.getByLabelText(
        /identificação da conta/i,
      );
      await user.type(identificationInput, "Test Account");
      const submitButton = screen.getByRole("button", { name: /criar conta/i });
      await user.click(submitButton);
      // Dialog should close after successful submission
      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });
    it("can be cancelled", async () => {
      const user = userEvent.setup();
      renderComponent(false);
      // Open dialog
      const triggerButton = screen.getByRole("button", { name: /nova conta/i });
      await user.click(triggerButton);
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      // Click cancel button
      const cancelButton = screen.getByRole("button", { name: /cancelar/i });
      await user.click(cancelButton);
      // Dialog should close
      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
      // Mutation should not have been called
      expect(mockMutateAsync).not.toHaveBeenCalled();
    });
  });
  describe("Currency selection", () => {
    it("renders currency selector with proper label", async () => {
      const user = userEvent.setup();
      renderComponent(false);
      // Open dialog
      const triggerButton = screen.getByRole("button", { name: /nova conta/i });
      await user.click(triggerButton);
      // Check that currency selector is present
      expect(
        screen.getByRole("combobox", { name: /moeda/i }),
      ).toBeInTheDocument();
    });
  });
  describe("Form validation", () => {
    it("validates minimum identification length", async () => {
      const user = userEvent.setup();
      renderComponent(false);
      // Open dialog
      const triggerButton = screen.getByRole("button", { name: /nova conta/i });
      await user.click(triggerButton);
      // Enter single character
      const identificationInput = screen.getByLabelText(
        /identificação da conta/i,
      );
      await user.type(identificationInput, "A");
      // Try to submit
      const submitButton = screen.getByRole("button", { name: /criar conta/i });
      await user.click(submitButton);
      await waitFor(() => {
        expect(
          screen.getByText(/identificação deve ter pelo menos 2 caracteres/i),
        ).toBeInTheDocument();
      });
    });
    it("validates maximum identification length", async () => {
      const user = userEvent.setup();
      renderComponent(false);
      // Open dialog
      const triggerButton = screen.getByRole("button", { name: /nova conta/i });
      await user.click(triggerButton);
      // Enter string longer than 50 characters
      const identificationInput = screen.getByLabelText(
        /identificação da conta/i,
      );
      const longString = "A".repeat(51);
      await user.type(identificationInput, longString);
      // Try to submit
      const submitButton = screen.getByRole("button", { name: /criar conta/i });
      await user.click(submitButton);
      await waitFor(() => {
        expect(
          screen.getByText(/identificação deve ter no máximo 50 caracteres/i),
        ).toBeInTheDocument();
      });
    });
    it("accepts negative initial amounts", async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValueOnce({});
      renderComponent(false);
      // Open dialog
      const triggerButton = screen.getByRole("button", { name: /nova conta/i });
      await user.click(triggerButton);
      // Fill form with negative amount
      const identificationInput = screen.getByLabelText(
        /identificação da conta/i,
      );
      const initialAmountInput = screen.getByLabelText(/saldo inicial/i);
      await user.type(identificationInput, "Credit Card");
      await user.clear(initialAmountInput);
      // Use fireEvent for negative numbers
      fireEvent.change(initialAmountInput, { target: { value: "-1000" } });
      // Submit form
      const submitButton = screen.getByRole("button", { name: /criar conta/i });
      await user.click(submitButton);
      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            identification: "Credit Card",
            initial_amount: -1000,
            currency: "BRL",
            kind: "",
          }),
        );
      });
      // Should not show validation error for negative amount
      expect(
        screen.queryByText(/valor inicial deve ser positivo/i),
      ).not.toBeInTheDocument();
    });
    it("handles zero initial amount", async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValueOnce({});
      renderComponent(false);
      // Open dialog
      const triggerButton = screen.getByRole("button", { name: /nova conta/i });
      await user.click(triggerButton);
      // Fill form with zero amount (default)
      const identificationInput = screen.getByLabelText(
        /identificação da conta/i,
      );
      await user.type(identificationInput, "New Account");
      // Submit form (initial_amount defaults to 0)
      const submitButton = screen.getByRole("button", { name: /criar conta/i });
      await user.click(submitButton);
      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            identification: "New Account",
            initial_amount: 0,
            currency: "BRL",
            kind: "",
          }),
        );
      });
    });
  });
  describe("Responsive behavior", () => {
    it("renders properly on mobile devices", () => {
      renderComponent(true);
      const button = screen.getByRole("button", { name: /nova conta/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("Nova Conta");
    });
    it("renders properly on desktop devices", () => {
      renderComponent(false);
      const button = screen.getByRole("button", { name: /nova conta/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("Nova Conta");
    });
  });
  describe("Accessibility", () => {
    it("has proper form labels", async () => {
      const user = userEvent.setup();
      renderComponent(false);
      // Open dialog
      const triggerButton = screen.getByRole("button", { name: /nova conta/i });
      await user.click(triggerButton);
      // Check all form fields have proper labels
      expect(
        screen.getByLabelText(/identificação da conta/i),
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/moeda/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/saldo inicial/i)).toBeInTheDocument();
    });
    it("has descriptive help text", async () => {
      const user = userEvent.setup();
      renderComponent(false);
      // Open dialog
      const triggerButton = screen.getByRole("button", { name: /nova conta/i });
      await user.click(triggerButton);
      // Check form descriptions
      expect(
        screen.getByText(/nome ou descrição para identificar esta conta/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/moeda principal desta conta/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /saldo atual desta conta.*positivo para crédito.*negativo para débito/i,
        ),
      ).toBeInTheDocument();
    });
    it("has proper dialog title and description", async () => {
      const user = userEvent.setup();
      renderComponent(false);
      // Open dialog
      const triggerButton = screen.getByRole("button", { name: /nova conta/i });
      await user.click(triggerButton);
      expect(
        screen.getByRole("dialog", { name: /criar nova conta/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Adicione uma nova conta financeira ao seu portfólio"),
      ).toBeInTheDocument();
    });
  });
});
