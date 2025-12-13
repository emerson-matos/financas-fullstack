// import { render } from "@testing-library/react";
// import { describe, expect, it } from "vitest";
// import { TopHatLogo } from "./top-hat-logo";
// describe("TopHatLogo", () => {
//   it("renders without crashing", () => {
//     render(<TopHatLogo />);
//   });
//   it("renders with the correct src and alt attributes", () => {
//     const { getByAltText } = render(<TopHatLogo />);
//     const img = getByAltText("TopHat Logo") as HTMLImageElement;
//     expect(img).toBeTruthy();
//     expect(img.src).toContain("/assets/tophat.svg");
//     expect(img.className).toContain("size-8");
//     expect(img.alt).toBe("TopHat Logo");
//   });
//   it("applies custom className if provided", () => {
//     const { getByAltText } = render(<TopHatLogo className="custom-class" />);
//     const img = getByAltText("TopHat Logo");
//     expect(img.className).toContain("custom-class");
//     expect(img.className).toContain("size-8");
//   });
// });
