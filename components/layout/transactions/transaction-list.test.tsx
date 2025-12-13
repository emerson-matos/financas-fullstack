import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  compactTransactionColumns,
  defaultTransactionColumns,
} from "@/components/layout/transactions/columns";
import { TransactionList } from "@/components/layout/transactions/transaction-list";
// Mock the DataTable component
vi.mock("@/components/datatable/app-datatable", () => ({
  DataTable: vi.fn((props) => {
    // Store the props for testing
    lastProps = props;
    return (
      <div data-testid="mock-data-table">
        <div>Columns: {props.columns.length}</div>
        <div>QueryKey: {props.queryKey}</div>
        {props.limit && <div>Limit: {props.limit}</div>}
        {props.accountId && <div>AccountId: {props.accountId}</div>}
        <div>Props: {JSON.stringify(props)}</div>
      </div>
    );
  }),
}));
// Define the mock component with proper typing
interface MockDataTableProps {
  columns: typeof defaultTransactionColumns;
  queryKey: string;
  limit?: number;
  accountId?: string;
  defaultSort?: { id: string; desc: boolean };
}
// Create a mock component that stores its props for testing
let lastProps: MockDataTableProps | undefined;
// Mock useNavigate from @tanstack/react-router
vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual =
    (await importOriginal()) as typeof import("@tanstack/react-router");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});
describe("TransactionList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lastProps = undefined;
  });
  it("renders with default props", () => {
    render(<TransactionList />);
    expect(screen.getByTestId("mock-data-table")).toBeTruthy();
    expect(lastProps).toBeDefined();
    expect(lastProps?.columns).toEqual(compactTransactionColumns);
    expect(lastProps?.queryKey).toBe("transactions");
    expect(lastProps?.limit).toBeUndefined();
    expect(lastProps?.accountId).toBeUndefined();
  });
  it("renders with account filter", () => {
    render(<TransactionList accountId="123" />);
    expect(screen.getByTestId("mock-data-table")).toBeTruthy();
    expect(lastProps).toBeDefined();
    expect(lastProps?.queryKey).toBe("transactions");
    expect(lastProps?.accountId).toBe("123");
  });
  it("renders with custom columns", () => {
    render(<TransactionList columns={defaultTransactionColumns} />);
    expect(screen.getByTestId("mock-data-table")).toBeTruthy();
    expect(lastProps).toBeDefined();
    expect(lastProps?.columns).toEqual(defaultTransactionColumns);
  });
});
