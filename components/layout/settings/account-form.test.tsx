import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi, describe, beforeEach, expect, it } from "vitest";


// Mock React Router explicitly in this test file only
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: mockPush,
    history: {
      back: vi.fn(),
    },
  })),
}));

// Mock the userService
vi.mock("@/lib/services/user", () => ({
  userService: {
    deleteUser: vi.fn(),
  },
}));

// Mock useToast
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

import { userService } from "@/lib/services/user";
import { CustomerAccountForm } from "./customer-account-form";

beforeEach(() => {
  // Reset mocks before each test
  vi.clearAllMocks();
  mockPush.mockClear(); // Clear mockPush calls
});
describe("AccountForm", () => {
  it("renderiza aviso e botão de apagar usuário", () => {
    render(<CustomerAccountForm />);
    expect(
      screen.getByText(/apagar permanentemente seu usuário/i),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /apagar usuário do app/i }),
    ).toBeTruthy();
  });
  it("abre o dialog de confirmação ao clicar no botão", () => {
    render(<CustomerAccountForm />);
    fireEvent.click(
      screen.getByRole("button", { name: /apagar usuário do app/i }),
    );
    expect(screen.getByRole("alertdialog")).toBeTruthy();
    expect(screen.getByText(/apagar usuário\?/i)).toBeTruthy();
    expect(screen.getByText(/esta ação não pode ser desfeita/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /cancelar/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /^sim$/i })).toBeTruthy();
  });
  it("mostra feedback de sucesso ao confirmar exclusão", async () => {
    // Mock successful delete
    vi.mocked(userService.deleteUser).mockResolvedValue({ success: true });
    render(<CustomerAccountForm />);
    fireEvent.click(
      screen.getByRole("button", { name: /apagar usuário do app/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: /^sim$/i }));
    // Wait for the success dialog to appear
    const successTitle = await screen.findByText(
      "Usuário apagado com sucesso!",
    );
    expect(successTitle).toBeTruthy();
    expect(
      screen.getByText(/sua conta e todos os dados foram removidos/i),
    ).toBeTruthy();
    // Simulate closing the dialog
    fireEvent.click(screen.getByRole("button", { name: /ok/i }));
    // Should redirect
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });
  it("mostra feedback de erro quando a exclusão falha", async () => {
    // Mock failed delete
    vi.mocked(userService.deleteUser).mockResolvedValue({ success: false });
    render(<CustomerAccountForm />);
    fireEvent.click(
      screen.getByRole("button", { name: /apagar usuário do app/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: /^sim$/i }));
    // Wait for the error dialog to appear
    const errorTitle = await screen.findByText("Erro ao apagar usuário");
    expect(errorTitle).toBeTruthy();
    expect(
      screen.getByText(/ocorreu um erro ao tentar apagar seu usuário/i),
    ).toBeTruthy();
  });
  it("mostra feedback de erro quando ocorre exceção", async () => {
    // Mock exception
    vi.mocked(userService.deleteUser).mockRejectedValue(
      new Error("Network error"),
    );
    render(<CustomerAccountForm />);
    fireEvent.click(
      screen.getByRole("button", { name: /apagar usuário do app/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: /^sim$/i }));
    // Wait for the error dialog to appear
    const errorTitle = await screen.findByText("Erro ao apagar usuário");
    expect(errorTitle).toBeTruthy();
    expect(
      screen.getByText(/ocorreu um erro ao tentar apagar seu usuário/i),
    ).toBeTruthy();
  });
});
