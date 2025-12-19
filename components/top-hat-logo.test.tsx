import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TopHatLogo } from "./top-hat-logo";

describe("TopHatLogo", () => {
  it("renders without crashing", () => {
    render(<TopHatLogo width={32} height={32} />);
  });

  it("renders with the correct src and alt attributes", () => {
    const { getByAltText } = render(<TopHatLogo width={32} height={32} />);
    const img = getByAltText("TopHat Logo") as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.src).toContain("data:image/svg+xml");
    expect(img.className).toContain("size-8");
    expect(img.alt).toBe("TopHat Logo");
  });

  it("applies custom className if provided", () => {
    const { getByAltText } = render(<TopHatLogo className="custom-class" width={32} height={32} />);
    const img = getByAltText("TopHat Logo");
    expect(img.className).toContain("custom-class");
    expect(img.className).toContain("size-8");
  });
});
