import { describe, it, expect, vi, beforeEach } from "vitest";
import { transactionService } from "./transactions";
import type { CreateTransactionRequest, ImportRequest } from "@/lib/types";

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

describe("transactionService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getTransactions", () => {
    it("should fetch transactions with default params", async () => {
      const mockData = {
        content: [],
        totalElements: 0,
        totalPages: 0,
      };
      mockApi.get.mockResolvedValueOnce({ data: mockData });

      const result = await transactionService.getTransactions();

      expect(mockApi.get).toHaveBeenCalledWith("/transactions", {
        params: {
          page: undefined,
          size: undefined,
          search: undefined,
          sort: undefined,
          start_date: undefined,
          end_date: undefined,
          account_id: undefined,
        },
      });
      expect(result).toEqual(mockData);
    });

    it("should fetch transactions with custom filters", async () => {
      const mockData = {
        content: [{ id: "1", name: "Test" }],
        totalElements: 1,
        totalPages: 1,
      };
      mockApi.get.mockResolvedValueOnce({ data: mockData });

      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-12-31");

      const result = await transactionService.getTransactions({
        page: 1,
        size: 20,
        search: "groceries",
        sort: ["date-desc"],
        startDate,
        endDate,
        accountId: "acc-123",
      });

      expect(mockApi.get).toHaveBeenCalledWith("/transactions", {
        params: {
          page: 1,
          size: 20,
          search: "groceries",
          sort: "date-desc",
          start_date: "2024-01-01",
          end_date: "2024-12-31",
          account_id: "acc-123",
        },
      });
      expect(result).toEqual(mockData);
    });
  });

  describe("getTransaction", () => {
    it("should fetch single transaction and map account/category ids", async () => {
      const mockData = {
        id: "tx-123",
        name: "Test Transaction",
        account: { id: "acc-456" },
        category: { id: "cat-789" },
      };
      mockApi.get.mockResolvedValueOnce({ data: mockData });

      const result = await transactionService.getTransaction("tx-123");

      expect(mockApi.get).toHaveBeenCalledWith("/transactions/tx-123");
      expect(result).toEqual(
        expect.objectContaining({
          id: "tx-123",
          name: "Test Transaction",
          account_id: "acc-456",
          category_id: "cat-789",
        }),
      );
    });
  });

  describe("createTransaction", () => {
    it("should create a basic transaction", async () => {
      const input: CreateTransactionRequest = {
        name: "New Transaction",
        description: "Test description",
        amount: 100.5,
        kind: "DEBIT",
        transactedAt: "2024-01-15",
        currency: "BRL",
        accountId: "acc-123",
        categoryId: "cat-456",
      };
      const mockResponse = { id: "tx-new", ...input };
      mockApi.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await transactionService.createTransaction(input);

      expect(mockApi.post).toHaveBeenCalledWith(
        "/transactions",
        expect.objectContaining({
          name: "New Transaction",
          description: "Test description",
          amount: 100.5,
          kind: "DEBIT",
          transacted_at: "2024-01-15",
          currency: "BRL",
          account: { id: "acc-123" },
          category: { id: "cat-456" },
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("should create a transfer transaction with destination account", async () => {
      const input: CreateTransactionRequest = {
        name: "Transfer",
        description: "Transfer description",
        amount: 200,
        kind: "TRANSFER",
        transactedAt: "2024-01-15",
        currency: "BRL",
        accountId: "acc-source",
        destinationAccountId: "acc-dest",
      };
      const mockResponse = { id: "tx-transfer", ...input };
      mockApi.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await transactionService.createTransaction(input);

      expect(mockApi.post).toHaveBeenCalledWith(
        "/transactions",
        expect.objectContaining({
          name: "Transfer",
          kind: "TRANSFER",
          destination_account: { id: "acc-dest" },
        }),
      );
      expect(result).toEqual(mockResponse);
    });

    it("should create transaction with group splits", async () => {
      const input: CreateTransactionRequest = {
        name: "Group Expense",
        description: "Group expense description",
        amount: 300,
        kind: "DEBIT",
        transactedAt: "2024-01-15",
        currency: "BRL",
        accountId: "acc-123",
        groupId: "group-1",
        splits: [
          { userId: "user-1", amount: 150 },
          { userId: "user-2", amount: 150 },
        ],
      };
      const mockResponse = { id: "tx-group", ...input };
      mockApi.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await transactionService.createTransaction(input);

      expect(mockApi.post).toHaveBeenCalledWith(
        "/transactions",
        expect.objectContaining({
          group_id: "group-1",
          split_proposal: expect.objectContaining({
            group_id: "group-1",
            amount: 300,
            status: "pending",
            split_rules: {
              splits: [
                { user_id: "user-1", amount: 150 },
                { user_id: "user-2", amount: 150 },
              ],
            },
          }),
        }),
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("updateTransaction", () => {
    it("should update a transaction", async () => {
      const input = {
        name: "Updated Transaction",
        description: "Updated description",
        amount: 200,
        kind: "CREDIT" as const,
        transactedAt: "2024-02-01",
        accountId: "acc-123",
        categoryId: "cat-456",
      };
      const mockResponse = { id: "tx-123", ...input };
      mockApi.put.mockResolvedValueOnce({ data: mockResponse });

      const result = await transactionService.updateTransaction(
        "tx-123",
        input,
      );

      expect(mockApi.put).toHaveBeenCalledWith(
        "/transactions/tx-123",
        expect.objectContaining({
          name: "Updated Transaction",
          amount: 200,
          kind: "CREDIT",
        }),
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("deleteTransaction", () => {
    it("should delete a transaction", async () => {
      mockApi.delete.mockResolvedValueOnce({ data: null });

      await transactionService.deleteTransaction("tx-123");

      expect(mockApi.delete).toHaveBeenCalledWith("/transactions/tx-123");
    });
  });

  describe("importTransactions", () => {
    it("should import multiple transactions", async () => {
      const transactions: CreateTransactionRequest[] = [
        {
          name: "Import 1",
          description: "Import desc 1",
          amount: 50,
          kind: "DEBIT",
          transactedAt: "2024-01-01",
          currency: "BRL",
          accountId: "acc-1",
          categoryId: "cat-1",
        },
        {
          name: "Import 2",
          description: "Import desc 2",
          amount: 75,
          kind: "CREDIT",
          transactedAt: "2024-01-02",
          currency: "BRL",
          accountId: "acc-1",
        },
      ];
      const mockResponse = { imported: 2 };
      mockApi.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await transactionService.importTransactions(transactions);

      expect(mockApi.post).toHaveBeenCalledWith(
        "/transactions/bulk",
        expect.objectContaining({
          transactions: expect.arrayContaining([
            expect.objectContaining({
              name: "Import 1",
              amount: 50,
              account: { id: "acc-1" },
              category: { id: "cat-1" },
            }),
            expect.objectContaining({
              name: "Import 2",
              amount: 75,
            }),
          ]),
        }),
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("parseFileImport", () => {
    it("should parse file import request", async () => {
      const request: ImportRequest = {
        fileContent: "OFX content here",
        fileName: "bank.ofx",
        fileFormat: "ofx",
        accountId: "acc-123",
      };
      const mockResponse = { transactions: [], errors: [] };
      mockApi.post.mockResolvedValueOnce({ data: mockResponse });

      const result = await transactionService.parseFileImport(request);

      expect(mockApi.post).toHaveBeenCalledWith("/transactions/import", {
        file_content: "OFX content here",
        file_name: "bank.ofx",
        file_format: "ofx",
        account_id: "acc-123",
      });
      expect(result).toEqual(mockResponse);
    });
  });
});

