import { render, screen } from "@testing-library/react";
import { Home, Settings } from "lucide-react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SidebarProvider } from "@/components/ui/sidebar";
import type { AppSidebarConfig } from "@/lib/types";
import { AppSidebar } from "./app-sidebar";
// Mock the UserNav component
vi.mock("@/components/layout/header/user-nav", () => ({
  UserNav: () => <div data-testid="user-nav">User Navigation</div>,
}));
// Mock the TopHatLogo component
vi.mock("@/components/top-hat-logo", () => ({
  TopHatLogo: () => <div data-testid="top-hat-logo">TopHat Logo</div>,
}));
// Mock Next.js Link
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  } & any) => (
    <a href={href} data-testid={`link-${href}`} data-disabled={props.disabled} {...props}>
      {children}
    </a>
  ),
}));
// Helper function to render with router context
function renderWithRouter(component: React.ReactElement) {
  return render(<SidebarProvider>{component}</SidebarProvider>);
}
describe("AppSidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  describe("Default Configuration", () => {
    it("renders with default configuration", () => {
      renderWithRouter(<AppSidebar />);
      // Check brand name and subtitle
      expect(screen.getByText("TopHat")).toBeInTheDocument();
      expect(screen.getByText("Company")).toBeInTheDocument();
      // Check logo
      expect(screen.getByTestId("top-hat-logo")).toBeInTheDocument();
      // Check user navigation
      expect(screen.getByTestId("user-nav")).toBeInTheDocument();
      // Check group label
      expect(screen.getByText("Páginas")).toBeInTheDocument();
    });
    it("renders all default menu items", () => {
      renderWithRouter(<AppSidebar />);
      const expectedItems = [
        "Dashboard",
        "Contas",
        "Transações",
        "Orçamentos",
        "Exportar",
        "Relatórios",
        "Configurações",
      ];
      expectedItems.forEach((item) => {
        expect(screen.getByText(item)).toBeInTheDocument();
      });
    });
    it("renders correct navigation links", () => {
      renderWithRouter(<AppSidebar />);
      const expectedLinks = [
        { text: "Dashboard", href: "/dashboard/home" },
        { text: "Contas", href: "/dashboard/accounts" },
        { text: "Transações", href: "/dashboard/transactions" },
        { text: "Orçamentos", href: "/dashboard/budgets" },
        { text: "Exportar", href: "/dashboard/export" },
        { text: "Relatórios", href: "/dashboard/reports" },
        { text: "Configurações", href: "/dashboard/settings" },
      ];
      expectedLinks.forEach(({ text, href }) => {
        // Get all links with this href and find the one containing the expected text
        const links = screen.getAllByTestId(`link-${href}`);
        const menuLink = links.find((link) => link.textContent?.includes(text));
        expect(menuLink).toBeInTheDocument();
        expect(menuLink).toHaveAttribute("href", href);
        expect(menuLink).toHaveTextContent(text);
      });
    });
  });
  describe("Custom Configuration", () => {
    it("accepts custom brand name and subtitle", () => {
      const customConfig: Partial<AppSidebarConfig> = {
        brandName: "Custom App",
        brandSubtitle: "Custom Subtitle",
      };
      renderWithRouter(<AppSidebar config={customConfig} />);
      expect(screen.getByText("Custom App")).toBeInTheDocument();
      expect(screen.getByText("Custom Subtitle")).toBeInTheDocument();
    });
    it("accepts custom home URL", () => {
      const customConfig: Partial<AppSidebarConfig> = {
        homeUrl: "/custom/home",
      };
      renderWithRouter(<AppSidebar config={customConfig} />);
      const homeLink = screen.getByTestId("link-/custom/home");
      expect(homeLink).toBeInTheDocument();
    });
    it("accepts custom menu groups and items", () => {
      const customConfig: Partial<AppSidebarConfig> = {
        groups: [
          {
            id: "custom-group",
            label: "Custom Group",
            items: [
              {
                id: "custom-item-1",
                title: "Custom Item 1",
                url: "/custom/item1",
                icon: Home,
                description: "Custom description 1",
              },
              {
                id: "custom-item-2",
                title: "Custom Item 2",
                url: "/custom/item2",
                icon: Settings,
                description: "Custom description 2",
                badge: "New",
              },
            ],
          },
        ],
      };
      renderWithRouter(<AppSidebar config={customConfig} />);
      expect(screen.getByText("Custom Group")).toBeInTheDocument();
      expect(screen.getByText("Custom Item 1")).toBeInTheDocument();
      expect(screen.getByText("Custom Item 2")).toBeInTheDocument();
      expect(screen.getByText("New")).toBeInTheDocument();
    });
  });
  describe("Menu Item Features", () => {
    it("renders badges for menu items", () => {
      const configWithBadge: Partial<AppSidebarConfig> = {
        groups: [
          {
            id: "test-group",
            label: "Test Group",
            items: [
              {
                id: "item-with-badge",
                title: "Item with Badge",
                url: "/test",
                icon: Home,
                badge: "5",
              },
            ],
          },
        ],
      };
      renderWithRouter(<AppSidebar config={configWithBadge} />);
      expect(screen.getByText("5")).toBeInTheDocument();
    });
    it("handles disabled menu items", () => {
      const configWithDisabled: Partial<AppSidebarConfig> = {
        groups: [
          {
            id: "test-group",
            label: "Test Group",
            items: [
              {
                id: "disabled-item",
                title: "Disabled Item",
                url: "/disabled",
                icon: Home,
                isDisabled: true,
              },
            ],
          },
        ],
      };
      renderWithRouter(<AppSidebar config={configWithDisabled} />);
      const disabledLink = screen.getByTestId("link-/disabled");
      expect(disabledLink).toHaveAttribute("data-disabled", "true");
    });
    it("renders menu items with proper structure", () => {
      renderWithRouter(<AppSidebar />);
      // Check that sidebar menu items render with expected content
      const dashboardLinks = screen.getAllByTestId("link-/dashboard/home");
      const menuLink = dashboardLinks.find((link) =>
        link.textContent?.includes("Dashboard"),
      );
      expect(menuLink).toBeInTheDocument();
      expect(menuLink).toHaveTextContent("Dashboard");
      // Verify the link structure includes an icon (SVG element)
      const iconElement = menuLink?.querySelector("svg");
      expect(iconElement).toBeInTheDocument();
    });
  });
  describe("Accessibility", () => {
    it("has proper heading structure", () => {
      renderWithRouter(<AppSidebar />);
      // Check that group labels are properly rendered
      expect(screen.getByText("Páginas")).toBeInTheDocument();
    });
    it("has proper link accessibility", () => {
      renderWithRouter(<AppSidebar />);
      const links = screen.getAllByRole("link");
      expect(links.length).toBeGreaterThan(0);
      links.forEach((link) => {
        expect(link).toHaveAttribute("href");
      });
    });
    it("supports keyboard navigation", () => {
      renderWithRouter(<AppSidebar />);
      const homeLinks = screen.getAllByTestId("link-/dashboard/home");
      const menuLink = homeLinks.find((link) =>
        link.textContent?.includes("Dashboard"),
      );
      menuLink?.focus();
      expect(document.activeElement).toBe(menuLink);
    });
  });
  describe("Props and Styling", () => {
    it("accepts custom className", () => {
      const { container } = renderWithRouter(
        <AppSidebar className="custom-sidebar" />,
      );
      const sidebar = container.querySelector(".custom-sidebar");
      expect(sidebar).toBeInTheDocument();
    });
    it("accepts custom collapsible prop", () => {
      renderWithRouter(<AppSidebar collapsible="none" />);
      // Component should render without errors with different collapsible values
      expect(screen.getByText("TopHat")).toBeInTheDocument();
    });
    it("forwards additional props to Sidebar component", () => {
      renderWithRouter(<AppSidebar data-testid="custom-sidebar" />);
      expect(screen.getByTestId("custom-sidebar")).toBeInTheDocument();
    });
  });
  describe("Multiple Groups", () => {
    it("renders multiple sidebar groups", () => {
      const configWithMultipleGroups: Partial<AppSidebarConfig> = {
        groups: [
          {
            id: "group-1",
            label: "Group 1",
            items: [
              {
                id: "item-1",
                title: "Item 1",
                url: "/item1",
                icon: Home,
              },
            ],
          },
          {
            id: "group-2",
            label: "Group 2",
            items: [
              {
                id: "item-2",
                title: "Item 2",
                url: "/item2",
                icon: Settings,
              },
            ],
          },
        ],
      };
      renderWithRouter(<AppSidebar config={configWithMultipleGroups} />);
      expect(screen.getByText("Group 1")).toBeInTheDocument();
      expect(screen.getByText("Group 2")).toBeInTheDocument();
      expect(screen.getByText("Item 1")).toBeInTheDocument();
      expect(screen.getByText("Item 2")).toBeInTheDocument();
    });
  });
  describe("Error Handling", () => {
    it("handles empty groups gracefully", () => {
      const configWithEmptyGroups: Partial<AppSidebarConfig> = {
        groups: [],
      };
      renderWithRouter(<AppSidebar config={configWithEmptyGroups} />);
      // Should still render header and footer
      expect(screen.getByText("TopHat")).toBeInTheDocument();
      expect(screen.getByTestId("user-nav")).toBeInTheDocument();
    });
    it("handles groups with empty items", () => {
      const configWithEmptyItems: Partial<AppSidebarConfig> = {
        groups: [
          {
            id: "empty-group",
            label: "Empty Group",
            items: [],
          },
        ],
      };
      renderWithRouter(<AppSidebar config={configWithEmptyItems} />);
      expect(screen.getByText("Empty Group")).toBeInTheDocument();
    });
  });
});
