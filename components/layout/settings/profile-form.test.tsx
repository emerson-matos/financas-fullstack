import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { ProfileForm } from "./profile-form";
vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    user: { name: "Test User", email: "test@example.com", picture: "" },
    isLoading: false,
    error: null,
  }),
}));
describe("ProfileForm", () => {
  it("renderiza avatar e campo de e-mail", () => {
    render(<ProfileForm />);
    // Avatar and name
    expect(screen.getByText("Test User")).toBeTruthy();
    // Email field
    expect(screen.getByLabelText(/e-mail/i)).toBeTruthy();
  });
});
