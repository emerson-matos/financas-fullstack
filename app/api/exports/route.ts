import { NextRequest, NextResponse } from "next/server";
import { createErrorResponse } from "@/lib/api/handlers";
import { requireAuth } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const { searchParams } = new URL(request.url);

    // Extract export parameters
    const exportFormat = searchParams.get("format") || "csv"; // csv, json
    const entityType = searchParams.get("type") || "transactions"; // transactions, accounts, budgets
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const supabase = await createClient();

    let data: any[] = [];
    const filename = `${entityType}_export_${new Date().toISOString().split("T")[0]}`;

    if (entityType === "transactions") {
      // Note: transactions table doesn't have user_id column.
      // RLS policy filters via account_id -> user_accounts -> user_id automatically.
      let query = supabase
        .from("transactions")
        .select(
          `
          *,
          account:user_accounts(id, identification),
          category:categories(id, name)
        `,
        )
        .is("deactivated_at", null)
        .order("transacted_date", { ascending: false });

      if (startDate) {
        query = query.gte("transacted_date", startDate);
      }
      if (endDate) {
        query = query.lte("transacted_date", endDate);
      }

      const { data: transactions, error } = await query;
      if (error) throw error;

      // Flatten data for CSV
      data = (transactions || []).map((t) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        amount: t.amount,
        currency: t.currency,
        kind: t.kind,
        transacted_date: t.transacted_date,
        transacted_time: t.transacted_time,
        account_name: t.account?.identification || "Unknown",
        category_name: t.category?.name || "Uncategorized",
      }));
    } else if (entityType === "accounts") {
      const { data: accounts, error } = await supabase
        .from("user_accounts")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;
      data = accounts || [];
    } else if (entityType === "budgets") {
      const { data: budgets, error } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;
      data = budgets;
    } else {
      return createErrorResponse(new Error("Invalid export type"), 400);
    }

    if (exportFormat === "json") {
      return new NextResponse(JSON.stringify(data, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${filename}.json"`,
        },
      });
    } else if (exportFormat === "csv") {
      const csv = convertToCSV(data);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${filename}.csv"`,
        },
      });
    } else {
      return createErrorResponse(new Error("Invalid export format"), 400);
    }
  } catch (error) {
    return createErrorResponse(error);
  }
}

function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) {
    return "";
  }

  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(",")];

  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header];
      const escaped = ("" + (value ?? "")).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
}

export async function POST(request: NextRequest) {
  try {
    // Keep placeholder for custom export creation if needed later
    const { userId } = await requireAuth();
    return new NextResponse(
      JSON.stringify({ message: "Not implemented yet", userId }),
      { status: 501 },
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
