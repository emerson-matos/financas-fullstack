import { describe, expect, it, vi } from "vitest";
import { GET } from "./route";
import { NextRequest } from "next/server";

vi.mock("@/lib/constants", () => ({
  APP_URL: "https://financas.tophatcompany.com.br",
  APP_NAME: "Finanças App",
  APP_DESCRIPTION: "Aplicação de gestão de finanças pessoais",
}));

describe("OG Image API", () => {
  it("should return OG image with default title", async () => {
    const request = new NextRequest("http://localhost/api/og");
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/png");
  });

  it("should accept custom title parameter", async () => {
    const request = new NextRequest("http://localhost/api/og?title=Custom%20Title");
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/png");
  });

  it("should have correct image dimensions", async () => {
    const request = new NextRequest("http://localhost/api/og");
    const response = await GET(request);

    expect(response.status).toBe(200);
  });

  it("should export correct metadata", async () => {
    const { alt, contentType, dynamic } = await import("./route");

    expect(alt).toBe("Finanças App - Gestão de Finanças Pessoais");
    expect(contentType).toBe("image/png");
    expect(dynamic).toBe("force-dynamic");
  });
});
