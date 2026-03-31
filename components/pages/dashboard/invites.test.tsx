import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useMyInvites, useAcceptInvite } from "@/hooks/use-groups";
import { Invites } from "./invites";

vi.mock("@/hooks/use-groups");

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/dashboard/invites",
}));

const mockAcceptInvite = vi.fn();

const pendingInvite = {
  id: "inv-1",
  token: "tok-abc",
  role: "member" as const,
  expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  status: "pending" as const,
  group: { id: "grp-1", name: "Apartamento", description: "Gastos do apto" },
};

const adminInvite = {
  id: "inv-2",
  token: "tok-xyz",
  role: "admin" as const,
  expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
  status: "pending" as const,
  group: { id: "grp-2", name: "Trabalho" },
};

describe("Invites page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAcceptInvite as ReturnType<typeof vi.fn>).mockReturnValue({
      mutate: mockAcceptInvite,
      isPending: false,
    });
  });

  describe("loading state", () => {
    it("renders skeleton cards while loading", () => {
      (useMyInvites as ReturnType<typeof vi.fn>).mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      render(<Invites />);

      // Header is always visible
      expect(screen.getByText("Convites Pendentes")).toBeInTheDocument();
      // Skeletons are rendered — no invite cards or empty state
      expect(screen.queryByText("Apartamento")).not.toBeInTheDocument();
      expect(screen.queryByText("Nenhum convite pendente")).not.toBeInTheDocument();
    });
  });

  describe("empty state", () => {
    it("shows empty state when there are no invites", () => {
      (useMyInvites as ReturnType<typeof vi.fn>).mockReturnValue({
        data: [],
        isLoading: false,
      });

      render(<Invites />);

      expect(screen.getByText("Nenhum convite pendente")).toBeInTheDocument();
      expect(
        screen.getByText(/quando alguém te convidar/i),
      ).toBeInTheDocument();
    });

    it("shows empty state when data is undefined and not loading", () => {
      (useMyInvites as ReturnType<typeof vi.fn>).mockReturnValue({
        data: undefined,
        isLoading: false,
      });

      render(<Invites />);

      expect(screen.getByText("Nenhum convite pendente")).toBeInTheDocument();
    });
  });

  describe("invite cards", () => {
    beforeEach(() => {
      (useMyInvites as ReturnType<typeof vi.fn>).mockReturnValue({
        data: [pendingInvite, adminInvite],
        isLoading: false,
      });
    });

    it("renders group names for each invite", () => {
      render(<Invites />);

      expect(screen.getByText("Apartamento")).toBeInTheDocument();
      expect(screen.getByText("Trabalho")).toBeInTheDocument();
    });

    it("renders group description when present", () => {
      render(<Invites />);

      expect(screen.getByText("Gastos do apto")).toBeInTheDocument();
    });

    it("renders member role badge", () => {
      render(<Invites />);

      expect(screen.getByText("Membro")).toBeInTheDocument();
    });

    it("renders admin role badge", () => {
      render(<Invites />);

      expect(screen.getByText("Administrador")).toBeInTheDocument();
    });

    it("renders expiry info for each invite", () => {
      render(<Invites />);

      const expiryTexts = screen.getAllByText(/expira/i);
      expect(expiryTexts.length).toBe(2);
    });

    it("renders Aceitar button for each invite", () => {
      render(<Invites />);

      const buttons = screen.getAllByRole("button", { name: /aceitar/i });
      expect(buttons).toHaveLength(2);
    });
  });

  describe("accept invite", () => {
    beforeEach(() => {
      (useMyInvites as ReturnType<typeof vi.fn>).mockReturnValue({
        data: [pendingInvite],
        isLoading: false,
      });
    });

    it("calls acceptInvite with the correct token when Aceitar is clicked", () => {
      render(<Invites />);

      fireEvent.click(screen.getByRole("button", { name: /aceitar/i }));

      expect(mockAcceptInvite).toHaveBeenCalledWith(
        "tok-abc",
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
    });

    it("redirects to the group page on successful accept", async () => {
      mockAcceptInvite.mockImplementation((_token, { onSuccess }) => {
        onSuccess();
      });

      render(<Invites />);

      fireEvent.click(screen.getByRole("button", { name: /aceitar/i }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/dashboard/groups/grp-1");
      });
    });

    it("disables the Aceitar button while a mutation is pending", () => {
      (useAcceptInvite as ReturnType<typeof vi.fn>).mockReturnValue({
        mutate: mockAcceptInvite,
        isPending: true,
      });

      render(<Invites />);

      expect(screen.getByRole("button", { name: /aceitar/i })).toBeDisabled();
    });
  });

  describe("expiry formatting", () => {
    it("shows 'Expira amanhã' when expiry is 1 day away", () => {
      // Use 0.5 days so Math.ceil(0.5) === 1
      const tomorrow = new Date(Date.now() + 0.5 * 24 * 60 * 60 * 1000).toISOString();
      (useMyInvites as ReturnType<typeof vi.fn>).mockReturnValue({
        data: [{ ...pendingInvite, expires_at: tomorrow }],
        isLoading: false,
      });

      render(<Invites />);

      expect(screen.getByText("Expira amanhã")).toBeInTheDocument();
    });

    it("shows 'Expira em X dias' for multi-day expiry", () => {
      // Use 4.5 days so Math.ceil(4.5) === 5
      const inFiveDays = new Date(Date.now() + 4.5 * 24 * 60 * 60 * 1000).toISOString();
      (useMyInvites as ReturnType<typeof vi.fn>).mockReturnValue({
        data: [{ ...pendingInvite, expires_at: inFiveDays }],
        isLoading: false,
      });

      render(<Invites />);

      expect(screen.getByText("Expira em 5 dias")).toBeInTheDocument();
    });

    it("shows 'Expirado' for past dates", () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      (useMyInvites as ReturnType<typeof vi.fn>).mockReturnValue({
        data: [{ ...pendingInvite, expires_at: yesterday }],
        isLoading: false,
      });

      render(<Invites />);

      expect(screen.getByText("Expirado")).toBeInTheDocument();
    });
  });
});
