import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DataTable } from "./app-datatable";
// Mock React Query to provide test data
vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual("@tanstack/react-query");
  return {
    ...actual,
    useQuery: () => ({
      data: {
        content: [
          { id: "1", name: "Item 1", value: 10 },
          { id: "2", name: "Item 2", value: 20 },
        ],
        page: {
          size: 10,
          total_elements: 2,
          total_pages: 1,
          number: 0,
        },
      },
      error: undefined,
      isLoading: false,
      refetch: vi.fn(),
    }),
  };
});
interface TestItem {
  id: string;
  name: string;
  value: number;
}
const columns: Array<ColumnDef<TestItem>> = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "value",
    header: "Value",
  },
];
const queryClient = new QueryClient();
describe("DataTable", () => {
  it("renders correct number of rows and columns with expected cell values", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <DataTable<TestItem> queryKey="test" columns={columns} />
      </QueryClientProvider>,
    );
    // Get the table body
    const table = screen.getByRole("table");
    const tbody = table.querySelector("tbody") as HTMLElement;
    const rows = within(tbody).getAllByRole("row");
    expect(rows).toHaveLength(2);
    // Check each row's cell values
    expect(within(rows[0]).getByText("Item 1")).toBeTruthy();
    expect(within(rows[0]).getByText("10")).toBeTruthy();
    expect(within(rows[1]).getByText("Item 2")).toBeTruthy();
    expect(within(rows[1]).getByText("20")).toBeTruthy();
    // Optionally, check the number of columns in the first row
    const cells = within(rows[0]).getAllByRole("cell");
    expect(cells).toHaveLength(2);
  });
});
