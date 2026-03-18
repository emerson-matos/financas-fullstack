import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TooltipProvider } from "@/components/ui/tooltip";
import { PreferencesForm } from "./preferences-form";

describe("PreferencesForm", () => {
  it("renderiza campos principais", () => {
    render(
      <TooltipProvider>
        <PreferencesForm />
      </TooltipProvider>,
    );
    expect(screen.getByLabelText(/tema/i)).toBeTruthy();
    expect(screen.getByLabelText(/idioma/i)).toBeTruthy();
  });
});
