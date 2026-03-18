import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TransactionList } from "@/components/layout/transactions/transaction-list";
import type { TimelineEntry } from "@/lib/types";

// Mock the TimelineList component
vi.mock("@/components/layout/timeline/timeline-list", () => ({
  TimelineList: vi.fn((props) => {
    lastProps = props;
    return <div data-testid="mock-timeline-list" />;
  }),
}));

interface MockTimelineProps {
  accountId?: string;
  limit?: number;
  onItemClick?: (id: string, entry: TimelineEntry) => void;
}

let lastProps: MockTimelineProps | undefined;
describe("TransactionList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    lastProps = undefined;
  });
  it("renders with default props", () => {
    render(<TransactionList />);
    expect(screen.getByTestId("mock-timeline-list")).toBeTruthy();
    expect(lastProps).toBeDefined();
    expect(lastProps?.limit).toBeUndefined();
    expect(lastProps?.accountId).toBeUndefined();
  });
  it("renders with account filter", () => {
    render(<TransactionList accountId="123" />);
    expect(screen.getByTestId("mock-timeline-list")).toBeTruthy();
    expect(lastProps).toBeDefined();
    expect(lastProps?.accountId).toBe("123");
  });
});
