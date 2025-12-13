import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";
import { AppBreadcrumb } from "./app-breadcrumb";
vi.mock("@/hooks/use-breadcrumbs");
describe("AppBreadcrumb", () => {
  it("renders breadcrumb with first and last two items", () => {
    const items = [
      { title: "Home", link: "/" },
      { title: "Dashboard", link: "/dashboard/home" },
      { title: "Accounts", link: "/dashboard/accounts" },
      { title: "Details", link: "/dashboard/accounts/details" },
      { title: "Edit", link: "/dashboard/accounts/details/edit" },
    ];
    vi.mocked(useBreadcrumbs).mockReturnValue(items);
    render(<AppBreadcrumb />);
    // Should show first item
    expect(screen.getByText("Home")).toBeTruthy();
    // Should show ellipsis
    expect(screen.getByText("...")).toBeTruthy();
    // Should show last two items
    expect(screen.getByText("Details")).toBeTruthy();
    expect(screen.getByText("Edit")).toBeTruthy();
    // Should not show middle items
    expect(screen.queryByText("Dashboard")).not.toBeTruthy();
    expect(screen.queryByText("Accounts")).not.toBeTruthy();
  });
  it("renders breadcrumb with less than 3 items", () => {
    const items = [
      { title: "Home", link: "/" },
      { title: "Dashboard", link: "/dashboard/home" },
    ];
    vi.mocked(useBreadcrumbs).mockReturnValue(items);
    render(<AppBreadcrumb />);
    // Should show all items
    expect(screen.getByText("Home")).toBeTruthy();
    expect(screen.getByText("Dashboard")).toBeTruthy();
    // Should not show ellipsis
    expect(screen.queryByText("...")).not.toBeTruthy();
  });
  it("renders breadcrumb with exactly 3 items", () => {
    const items = [
      { title: "Home", link: "/" },
      { title: "Dashboard", link: "/dashboard/home" },
      { title: "Accounts", link: "/dashboard/accounts" },
    ];
    vi.mocked(useBreadcrumbs).mockReturnValue(items);
    render(<AppBreadcrumb />);
    // Should show all items
    expect(screen.getByText("Home")).toBeTruthy();
    expect(screen.getByText("Dashboard")).toBeTruthy();
    expect(screen.getByText("Accounts")).toBeTruthy();
    // Should not show ellipsis
    expect(screen.queryByText("...")).not.toBeTruthy();
  });
});
