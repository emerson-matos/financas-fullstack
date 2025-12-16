import { NextRequest, NextResponse } from "next/server";
import { createErrorResponse, createSuccessResponse } from "@/lib/api/handlers";
import { requireAuth } from "@/lib/api/auth";
import { BadRequestAlertException } from "@/lib/api/errors";
import { Ofx } from "ofx-data-extractor";

// Type definitions for OFX data structure
interface OfxRawTransaction {
  TRNTYPE: string;
  DTPOSTED: string;
  TRNAMT: string;
  FITID: string;
  MEMO?: string;
  [key: string]: unknown;
}

interface OfxTransaction {
  accountId: string;
  destinationAccountId?: string;
  name?: string;
  description: string;
  amount: number;
  transactedDate: string;
  categoryId?: string;
  currency?: string;
  kind: "DEBIT" | "CREDIT" | "TRANSFER" | "UNKNOWN";
  // Additional fields for reference
  fitId?: string;
  memo?: string;
}

interface BankTransactionList {
  DTSTART?: string;
  DTEND?: string;
  STMTTRN?: OfxRawTransaction | OfxRawTransaction[];
  STRTTRN?: OfxRawTransaction | OfxRawTransaction[]; // Alternative name used by some parsers
}

interface StatementResponse {
  CURDEF?: string;
  BANKACCTFROM?: Record<string, unknown>;
  BANKTRANLIST?: BankTransactionList;
  LEDGERBAL?: Record<string, unknown>;
}

interface StatementTransactionResponse {
  TRNUID?: string;
  STATUS?: Record<string, unknown>;
  STMTRS?: StatementResponse;
}

interface CreditCardStatementResponse {
  CURDEF?: string;
  CCACCTFROM?: Record<string, unknown>;
  BANKTRANLIST?: BankTransactionList;
  CCSTMTTRN?: OfxRawTransaction | OfxRawTransaction[];
  LEDGERBAL?: Record<string, unknown>;
}

interface CreditCardTransactionResponse {
  TRNUID?: string;
  STATUS?: Record<string, unknown>;
  CCSTMTRS?: CreditCardStatementResponse;
}

interface BankMessagesResponse {
  STMTTRNRS?: StatementTransactionResponse;
}

interface CreditCardMessagesResponse {
  CCSTMTTRNRS?: CreditCardTransactionResponse;
}

interface OfxRoot {
  SIGNONMSGSRSV1?: Record<string, unknown>;
  BANKMSGSRSV1?: BankMessagesResponse;
  CREDITCARDMSGSRSV1?: CreditCardMessagesResponse;
}

interface OfxData {
  OFX?: OfxRoot;
  BANKMSGSRSV1?: BankMessagesResponse;
  CREDITCARDMSGSRSV1?: CreditCardMessagesResponse;
}

interface ParseOfxResponse {
  transactions: OfxTransaction[];
  statistics: {
    totalRecords: number;
    successfulRecords: number;
    failedRecords: number;
  };
  errors: string[];
}

interface RequestBody {
  file_content: string;
  account_id: string;
  file_name?: string;
  file_format?: string;
}

// Utility functions
function parseOfxDate(dateStr: string): string {
  if (!dateStr) {
    throw new Error("Date string is required");
  }

  // Check if already in YYYY-MM-DD format (parsed by library)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // Handle YYYYMMDD format
  if (dateStr.length < 8) {
    throw new Error(`Invalid OFX date format: ${dateStr}`);
  }

  const datePart = dateStr.substring(0, 8);
  const year = datePart.substring(0, 4);
  const month = datePart.substring(4, 6);
  const day = datePart.substring(6, 8);

  // Basic validation
  const parsedDate = new Date(`${year}-${month}-${day}`);
  if (isNaN(parsedDate.getTime())) {
    throw new Error(`Invalid date values: ${year}-${month}-${day}`);
  }

  return `${year}-${month}-${day}`;
}

function transformTransaction(
  t: OfxRawTransaction,
  accountId: string,
  currency?: string,
): OfxTransaction {
  // Parse amount
  const amount = parseFloat(t.TRNAMT);

  // Map OFX transaction type to application kind
  // In OFX, DEBIT typically means money going out (negative amount)
  // and CREDIT means money coming in (positive amount)
  let kind: "DEBIT" | "CREDIT" | "TRANSFER" | "UNKNOWN" = "UNKNOWN";

  if (t.TRNTYPE === "DEBIT" || t.TRNTYPE === "debit") {
    kind = "DEBIT";
  } else if (t.TRNTYPE === "CREDIT" || t.TRNTYPE === "credit") {
    kind = "CREDIT";
  } else if (t.TRNTYPE === "XFER" || t.TRNTYPE === "xfer") {
    kind = "TRANSFER";
  }

  return {
    accountId,
    description: t.MEMO || "No description",
    amount: Math.abs(amount), // Store absolute value, kind determines direction
    transactedDate: parseOfxDate(t.DTPOSTED),
    kind,
    currency,
    // Additional fields for reference
    fitId: t.FITID,
    memo: t.MEMO,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function findTransactionsInObject(obj: unknown): OfxRawTransaction[] | null {
  if (!isRecord(obj)) {
    return null;
  }

  // Check for STRTTRN (used by some parsers)
  if ("STRTTRN" in obj && obj.STRTTRN) {
    const strttrn = obj.STRTTRN;
    if (Array.isArray(strttrn)) {
      return strttrn as OfxRawTransaction[];
    }
    if (isRecord(strttrn)) {
      return [strttrn as OfxRawTransaction];
    }
  }

  // Check for STMTTRN (standard OFX)
  if ("STMTTRN" in obj && obj.STMTTRN) {
    const stmttrn = obj.STMTTRN;
    if (Array.isArray(stmttrn)) {
      return stmttrn as OfxRawTransaction[];
    }
    if (isRecord(stmttrn)) {
      return [stmttrn as OfxRawTransaction];
    }
  }

  // Recursively search in nested objects
  for (const value of Object.values(obj)) {
    const result = findTransactionsInObject(value);
    if (result) {
      return result;
    }
  }

  return null;
}

function normalizeTransactionArray(
  transactions: OfxRawTransaction | OfxRawTransaction[] | undefined,
): OfxRawTransaction[] {
  if (!transactions) {
    return [];
  }
  return Array.isArray(transactions) ? transactions : [transactions];
}

function extractTransactions(data: OfxData): OfxRawTransaction[] {
  // Handle case where STMTTRNRS might be an array
  const bankMsgs = data?.OFX?.BANKMSGSRSV1;
  if (bankMsgs?.STMTTRNRS) {
    const stmtTrnRs = Array.isArray(bankMsgs.STMTTRNRS)
      ? bankMsgs.STMTTRNRS[0]
      : bankMsgs.STMTTRNRS;

    const bankTranList = stmtTrnRs?.STMTRS?.BANKTRANLIST;
    if (bankTranList) {
      // Try STRTTRN first (some parsers use this)
      if (bankTranList.STRTTRN) {
        return normalizeTransactionArray(bankTranList.STRTTRN);
      }
      // Fall back to STMTTRN
      if (bankTranList.STMTTRN) {
        return normalizeTransactionArray(bankTranList.STMTTRN);
      }
    }
  }

  // Try standard bank account path without OFX wrapper
  const bankWithoutWrapper =
    data?.BANKMSGSRSV1?.STMTTRNRS?.STMTRS?.BANKTRANLIST;
  if (bankWithoutWrapper) {
    if (bankWithoutWrapper.STRTTRN) {
      return normalizeTransactionArray(bankWithoutWrapper.STRTTRN);
    }
    if (bankWithoutWrapper.STMTTRN) {
      return normalizeTransactionArray(bankWithoutWrapper.STMTTRN);
    }
  }

  // Try credit card path with OFX wrapper
  const ccMsgs = data?.OFX?.CREDITCARDMSGSRSV1;
  if (ccMsgs?.CCSTMTTRNRS) {
    const ccStmtTrnRs = Array.isArray(ccMsgs.CCSTMTTRNRS)
      ? ccMsgs.CCSTMTTRNRS[0]
      : ccMsgs.CCSTMTTRNRS;

    const ccBankTranList = ccStmtTrnRs?.CCSTMTRS?.BANKTRANLIST;
    if (ccBankTranList) {
      if (ccBankTranList.STRTTRN) {
        return normalizeTransactionArray(ccBankTranList.STRTTRN);
      }
      if (ccBankTranList.STMTTRN) {
        return normalizeTransactionArray(ccBankTranList.STMTTRN);
      }
    }

    // Try alternative credit card path
    const ccStmtRs = ccStmtTrnRs?.CCSTMTRS;
    if (ccStmtRs?.CCSTMTTRN) {
      return normalizeTransactionArray(ccStmtRs.CCSTMTTRN);
    }
  }

  // Try credit card path without OFX wrapper
  const ccWithoutWrapper =
    data?.CREDITCARDMSGSRSV1?.CCSTMTTRNRS?.CCSTMTRS?.BANKTRANLIST;
  if (ccWithoutWrapper) {
    if (ccWithoutWrapper.STRTTRN) {
      return normalizeTransactionArray(ccWithoutWrapper.STRTTRN);
    }
    if (ccWithoutWrapper.STMTTRN) {
      return normalizeTransactionArray(ccWithoutWrapper.STMTTRN);
    }
  }

  // If no standard path works, search recursively
  const foundTransactions = findTransactionsInObject(data);
  if (foundTransactions) {
    return foundTransactions;
  }

  return [];
}

function extractCurrency(data: OfxData): string | undefined {
  // Try bank statement
  const bankCurrency = data?.OFX?.BANKMSGSRSV1?.STMTTRNRS?.STMTRS?.CURDEF;
  if (bankCurrency && typeof bankCurrency === "string") {
    return bankCurrency;
  }

  // Try credit card statement
  const ccCurrency =
    data?.OFX?.CREDITCARDMSGSRSV1?.CCSTMTTRNRS?.CCSTMTRS?.CURDEF;
  if (ccCurrency && typeof ccCurrency === "string") {
    return ccCurrency;
  }

  return undefined;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Authentication
    await requireAuth();

    // Parse and validate request body
    const body = (await request.json()) as RequestBody;

    if (!body?.file_content) {
      throw new BadRequestAlertException(
        "Request body with file_content is required",
        "appTransaction",
        "invalidrequest",
      );
    }

    if (!body?.account_id) {
      throw new BadRequestAlertException(
        "Request body with account_id is required",
        "appTransaction",
        "invalidrequest",
      );
    }

    if (
      typeof body.file_content !== "string" ||
      body.file_content.trim() === ""
    ) {
      throw new BadRequestAlertException(
        "file_content must be a non-empty string",
        "appTransaction",
        "invalidcontent",
      );
    }

    // Parse OFX file
    let ofx: Ofx;
    let data: OfxData;

    try {
      ofx = new Ofx(body.file_content);
      data = ofx.getContent() as OfxData;
    } catch (error) {
      throw new BadRequestAlertException(
        `Failed to parse OFX file: ${error instanceof Error ? error.message : "Unknown error"}`,
        "appTransaction",
        "parseerror",
      );
    }

    if (!data) {
      throw new BadRequestAlertException(
        "OFX file contains no data",
        "appTransaction",
        "nodata",
      );
    }

    // Extract raw transactions
    const rawTransactions = extractTransactions(data);
    const currency = extractCurrency(data);

    if (rawTransactions.length === 0) {
      return createSuccessResponse(
        {
          transactions: [],
          statistics: {
            totalRecords: 0,
            successfulRecords: 0,
            failedRecords: 0,
          },
          errors: ["No transactions found in OFX file"],
        } as ParseOfxResponse,
        200,
      );
    }

    // Transform transactions with error handling
    const transactions: OfxTransaction[] = [];
    const errors: string[] = [];

    rawTransactions.forEach((rawTxn, index) => {
      try {
        const transaction = transformTransaction(
          rawTxn,
          body.account_id || "",
          currency,
        );
        transactions.push(transaction);
      } catch (error) {
        const errorMsg = `Transaction ${index + 1}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`;
        errors.push(errorMsg);
      }
    });

    const result: ParseOfxResponse = {
      transactions,
      statistics: {
        totalRecords: rawTransactions.length,
        successfulRecords: transactions.length,
        failedRecords: rawTransactions.length - transactions.length,
      },
      errors,
    };

    return createSuccessResponse(result, 200);
  } catch (error) {
    return createErrorResponse(error);
  }
}
