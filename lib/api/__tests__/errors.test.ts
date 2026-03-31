import { describe, it, expect } from "vitest";
import {
  ApiError,
  BadRequestAlertException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from "../errors";

describe("ApiError subclasses", () => {
  it("BadRequestAlertException has status 400", () => {
    const e = new BadRequestAlertException("msg", "entity", "key");
    expect(e).toBeInstanceOf(ApiError);
    expect(e.statusCode).toBe(400);
    expect(e.message).toBe("msg");
  });

  it("NotFoundException has status 404", () => {
    const e = new NotFoundException("msg", "entity", "key");
    expect(e).toBeInstanceOf(ApiError);
    expect(e.statusCode).toBe(404);
  });

  it("UnauthorizedException has status 401", () => {
    const e = new UnauthorizedException("msg");
    expect(e).toBeInstanceOf(ApiError);
    expect(e.statusCode).toBe(401);
  });

  it("ForbiddenException has status 403", () => {
    const e = new ForbiddenException("msg");
    expect(e).toBeInstanceOf(ApiError);
    expect(e.statusCode).toBe(403);
  });
});
