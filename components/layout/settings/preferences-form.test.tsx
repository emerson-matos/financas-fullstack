import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";


import { PreferencesForm } from "./preferences-form";

describe("PreferencesForm", () => {
  it("renderiza campos principais", () => {
    render(<PreferencesForm />);
    expect(screen.getByLabelText(/tema/i)).toBeTruthy();
    expect(screen.getByLabelText(/idioma/i)).toBeTruthy();
  });
});
