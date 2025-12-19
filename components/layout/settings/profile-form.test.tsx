import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { vi, describe, expect, it } from "vitest";


import { ProfileForm } from "./profile-form";

vi.mock("@/hooks/use-user", () => ({
  useUser: () => ({
    data: { name: "Test User", email: "test@example.com", picture: "" },
    isLoading: false,
    error: null,
  }),
}));

vi.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    user: { name: "Test User", email: "test@example.com", picture: "" },
    isLoading: false,
    error: null,
  }),
}));

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

describe("ProfileForm", () => {
  it("renderiza avatar e campo de e-mail", () => {
    render(
      <QueryClientProvider client={createQueryClient()}>
        <ProfileForm />
      </QueryClientProvider>,
    );
    // Avatar and name
    expect(screen.getByText("Test User")).toBeTruthy();
    // Email field
    expect(screen.getByLabelText(/e-mail/i)).toBeTruthy();
  });
});
