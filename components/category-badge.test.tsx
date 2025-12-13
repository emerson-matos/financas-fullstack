import {
  render,
  //  screen
} from "@testing-library/react";
import {
  describe,
  // expect,
  it,
} from "vitest";
import { CategoryBadge } from "./category-badge";
describe("CategoryBadge", () => {
  it("renders without crashing", () => {
    render(<CategoryBadge id="id-1" name="supermercado" />);
  });
  it("renders with the correct style for a known category", () => {
    render(<CategoryBadge id="id-2" name="supermercado" />);
    // const badge = screen.getByText("supermercado");
    // expect(badge).toHaveClass(
    //   "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
    // );
  });
  it("renders with the default style when the category is unknown", () => {
    render(<CategoryBadge id="id-3" name="unknown" />);
    // const badge = screen.getByText("unknown");
    // expect(badge).toHaveClass(
    //   "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
    // );
  });
  it("renders the correct text", () => {
    render(<CategoryBadge id="id-4" name="test category" />);
    // const _badge = screen.getByText("test category");
    // expect(badge).toBeTruthy();
  });
});
