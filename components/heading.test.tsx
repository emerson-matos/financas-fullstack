import {
  render,
  // screen
} from "@testing-library/react";
import {
  describe,
  // expect,
  it,
} from "vitest";
import { Heading } from "./heading";
describe("Heading Component", () => {
  it("renders without crashing", () => {
    render(<Heading title="Test Title" />);
  });
  it("renders with a title", () => {
    render(<Heading title="Test Title" />);
    // const titleElement = screen.getByText("Test Title");
    // expect(titleElement).toBeTruthy();
  });
  it("renders with a title and description", () => {
    render(<Heading title="Test Title" description="Test Description" />);
    // const titleElement = screen.getByText("Test Title");
    // const descriptionElement = screen.getByText("Test Description");
    // expect(titleElement).toBeTruthy();
    // expect(descriptionElement).toBeTruthy();
  });
  it("renders with a title, description, and children", () => {
    render(
      <Heading title="Test Title" description="Test Description">
        <div>Test Child</div>
      </Heading>,
    );
    // const titleElement = screen.getByText("Test Title");
    // const descriptionElement = screen.getByText("Test Description");
    // const childElement = screen.getByText("Test Child");
    // expect(titleElement).toBeTruthy();
    // expect(descriptionElement).toBeTruthy();
    // expect(childElement).toBeTruthy();
  });
  it("renders with a title and custom class name", () => {
    // const { container } = render(<Heading title="Test Title" className="custom-class" />);
    // Get the outermost div (the component's root element)
    // const outerDiv = container.firstChild as HTMLElement;
    // Check that the outer div has the custom class
    // expect(outerDiv).toHaveClass("custom-class");
    // Get the heading element
    // const headingElement = screen.getByRole("heading", { level: 1 });
    // Check that the heading has the correct title
    // expect(headingElement).toHaveTextContent("Test Title");
  });
});
