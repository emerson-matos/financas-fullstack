import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGroups } from "@/hooks/use-groups";
import { GroupList } from "./group-list";

vi.mock("@/hooks/use-groups");

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/dashboard/groups",
}));

// GroupCreateDialog uses internal state; mock it to keep tests focused
vi.mock("@/components/layout/groups/group-create-dialog", () => ({
  GroupCreateDialog: ({ open }: { open: boolean }) =>
    open ? <div data-testid="group-create-dialog" /> : null,
}));

const mockGroups = {
  content: [
    {
      id: "grp-1",
      name: "Apartamento",
      description: "Gastos do apto",
      created_at: "2024-01-01",
      updated_at: "2024-02-01",
      members: [{ id: "m1" }, { id: "m2" }],
    },
    {
      id: "grp-2",
      name: "Viagem",
      description: null,
      created_at: "2024-01-01",
      updated_at: "2024-01-15",
      members: [{ id: "m3" }],
    },
  ],
  page: { size: 10, total_elements: 2, total_pages: 1, number: 0 },
};

describe("GroupList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("error state", () => {
    it("shows error message when the query fails", () => {
      (useGroups as ReturnType<typeof vi.fn>).mockReturnValue({
        data: undefined,
        isError: true,
      });

      render(<GroupList />);

      expect(
        screen.getByText(/não foi possível carregar os grupos/i),
      ).toBeInTheDocument();
    });
  });

  describe("empty state", () => {
    it("shows empty message when no groups are returned", () => {
      (useGroups as ReturnType<typeof vi.fn>).mockReturnValue({
        data: { content: [], page: { size: 10, total_elements: 0, total_pages: 0, number: 0 } },
        isError: false,
      });

      render(<GroupList />);

      expect(screen.getByText("Nenhum grupo encontrado.")).toBeInTheDocument();
    });
  });

  describe("with groups", () => {
    beforeEach(() => {
      (useGroups as ReturnType<typeof vi.fn>).mockReturnValue({
        data: mockGroups,
        isError: false,
      });
    });

    it("renders a card for each group", () => {
      render(<GroupList />);

      expect(screen.getByText("Apartamento")).toBeInTheDocument();
      expect(screen.getByText("Viagem")).toBeInTheDocument();
    });

    it("renders group description when present", () => {
      render(<GroupList />);

      expect(screen.getByText("Gastos do apto")).toBeInTheDocument();
    });

    it("renders member count badge", () => {
      render(<GroupList />);

      expect(screen.getByText("2 membros")).toBeInTheDocument();
      expect(screen.getByText("1 membro")).toBeInTheDocument();
    });

    it("navigates to the group page when a card is clicked", () => {
      render(<GroupList />);

      fireEvent.click(screen.getByText("Apartamento"));

      expect(mockPush).toHaveBeenCalledWith("/dashboard/groups/grp-1");
    });
  });

  describe("novo grupo button", () => {
    beforeEach(() => {
      (useGroups as ReturnType<typeof vi.fn>).mockReturnValue({
        data: mockGroups,
        isError: false,
      });
    });

    it("renders the Novo Grupo button", () => {
      render(<GroupList />);

      expect(screen.getByRole("button", { name: /novo grupo/i })).toBeInTheDocument();
    });

    it("opens the GroupCreateDialog when clicked", () => {
      render(<GroupList />);

      fireEvent.click(screen.getByRole("button", { name: /novo grupo/i }));

      expect(screen.getByTestId("group-create-dialog")).toBeInTheDocument();
    });
  });
});
