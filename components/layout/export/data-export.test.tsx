import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DataExport } from "./data-export";
// Mock the toast hook
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));
describe("DataExport", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("renders without crashing", () => {
    expect(() => render(<DataExport />)).not.toThrow();
  });
  it("renders the form with required elements", () => {
    const { container } = render(<DataExport />);
    // Check for the card title using direct selector
    expect(
      container.querySelector('[data-slot="card-title"]'),
    ).toHaveTextContent("Exportar Dados");
    expect(screen.getByText("O que Exportar")).toBeTruthy();
    expect(screen.getByText("Formato de Exportação")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /Exportar Dados/i }),
    ).toBeTruthy();
  });
  it("shows date range fields when transactions is selected", () => {
    render(<DataExport />);
    // Date range should be visible by default (transactions selected)
    expect(screen.getByText("Data Inicial (Opcional)")).toBeTruthy();
    expect(screen.getByText("Data Final (Opcional)")).toBeTruthy();
  });
  it("shows default selected values", () => {
    render(<DataExport />);
    // Check that default values are selected
    expect(screen.getByDisplayValue("Transações")).toBeTruthy();
    expect(screen.getByDisplayValue("CSV (Excel)")).toBeTruthy();
  });
});
