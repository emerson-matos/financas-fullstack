import { NextRequest } from "next/server";
import { createErrorResponse, createSuccessResponse } from "@/lib/api/handlers";
import { requireAuth } from "@/lib/api/auth";
import { BadRequestAlertException } from "@/lib/api/errors";
import { Ofx } from "ofx-data-extractor";

function parseOfxDate(dateStr: string) {
  const datePart = dateStr.substring(0, 8);
  return `${datePart.substring(0, 4)}-${datePart.substring(
    4,
    6
  )}-${datePart.substring(6, 8)}`;
}

interface OfxTransaction {
  TRNTYPE: string;
  DTPOSTED: string;
  TRNAMT: string;
  FITID: string;
  MEMO: string;
  description: string;
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();

    if (!body || !body.file_content) {
      throw new BadRequestAlertException(
        "Request body with file_content is required",
        "appTransaction",
        "invalidrequest"
      );
    }

    const ofx = new Ofx(body.file_content);
    const data = ofx.getContent();

    let transactions: OfxTransaction[] = [];
    if (data?.OFX?.BANKMSGSRSV1?.STMTTRNRS?.STMTRS?.BANKTRANLIST?.STMTTRN) {
      transactions =
        data.OFX.BANKMSGSRSV1.STMTTRNRS.STMTRS.BANKTRANLIST.STMTTRN.map((t) => ({
          ...t,
          TRNAMT: t.TRNAMT,
          DTPOSTED: parseOfxDate(t.DTPOSTED),
          description: t.MEMO,
        }));
    } else if (
      data?.OFX?.CREDITCARDMSGSRSV1?.CCSTMTTRNRS?.CCSTMTRS?.BANKTRANLIST?.STMTTRN
    ) {
      transactions =
        data.OFX.CREDITCARDMSGSRSV1.CCSTMTTRNRS.CCSTMTRS.BANKTRANLIST.STMTTRN.map(
          (t) => ({
            ...t,
            TRNAMT: t.TRNAMT,
            DTPOSTED: parseOfxDate(t.DTPOSTED),
            description: t.MEMO,
          })
        );
    }

    const result = {
      transactions,
      statistics: {
        totalRecords: transactions.length,
        successfulRecords: transactions.length,
        failedRecords: 0,
      },
      errors: [],
    };

    return createSuccessResponse(result, 200);
  } catch (error) {
    return createErrorResponse(error);
  }
}
