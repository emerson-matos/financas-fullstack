import { describe, it, expect, vi, beforeEach } from "vitest";
import { accountService } from "./accounts";
import type { UserAccount } from "@/lib/types";

vi.mock("@/lib/api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import { api } from "@/lib/api";

const mockApi = api as ReturnType<typeof vi.fn>;

describe("accountService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAccounts", () => {
    it("should fetch accounts with default params", async () => {
      const mockData = {
        content: [],
        totalElements: 0,
        totalPages: 0,
      };
      mockApi.get.mockResolvedValueOnce({ data: mockData });

      const result = await accountService.getAccounts({});

      expect(mockApi.get).toHaveBeenCalledWith("/accounts", {
        params: {
          sort: undefined,
          page: undefined,
          size: undefined,
        },
      });
      expect(result).toEqual(mockData);
    });

    it("should fetch accounts with custom params", async () => {
      const mockData = {
        content: [{ id: "acc-1", identification: "Bank Account" }],
        totalElements: 1,
        totalPages: 1,
      };
      mockApi.get.mockResolvedValueOnce({ data: mockData });

      const result = await accountService.getAccounts({
        page: 0,
        size: 10,
        sort: ["identification-asc"],
      });

      expect(mockApi.get).toHaveBeenCalledWith("/accounts", {
        params: {
          sort: "identification-asc",
          page: 0,
          size: 10,
        },
      });
      expect(result).toEqual(mockData);
    });
  });

  describe("getAccount", () => {
    it("should fetch single account", async () => {
      const mockData: UserAccount = {
        id: "acc-123",
        user_id: "user-1",
        identification: "My Account",
        kind: "CHECKING",
        currency: "BRL",
        current_amount: 1000,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        deactivated_at: null,
      };
      mockApi.get.mockResolvedValueOnce({ data: mockData });

      const result = await accountService.getAccount("acc-123");

      expect(mockApi.get).toHaveBeenCalledWith("/accounts/acc-123");
      expect(result).toEqual(mockData);
    });
  });

  describe("createAccount", () => {
    it("should create a new account", async () => {
      const input: Partial<UserAccount> = {
        identification: "New Account",
        kind: "CHECKING",
        currency: "BRL",
      };
      const mockResponse: UserAccount = {
        id: "acc-new",
        user_id: "user-1",
        identification: "New Account",
        kind: "CHECKING",
        currency: "BRL",
        current_amount: 0,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        deactivated_at: null,
      };
      mockApi.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await accountService.createAccount(input);

      expect(mockApi.post).toHaveBeenCalledWith("/accounts", input);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("updateAccount", () => {
    it("should update an account", async () => {
      const input: Partial<UserAccount> = {
        identification: "Updated Account",
      };
      const mockResponse = { id: "acc-123", ...input };
      mockApi.put.mockResolvedValueOnce({ data: mockResponse });

      const result = await accountService.updateAccount("acc-123", input);

      expect(mockApi.put).toHaveBeenCalledWith("/accounts/acc-123", input);
      expect(result).toEqual(mockResponse);
    });
  });

  describe("deleteAccount", () => {
    it("should delete an account", async () => {
      mockApi.delete.mockResolvedValueOnce({ data: null });

      await accountService.deleteAccount("acc-123");

      expect(mockApi.delete).toHaveBeenCalledWith("/accounts/acc-123");
    });
  });
});

