import { createClient } from "./server";
import type { Database } from "./types";

export type Tables = Database["public"]["Tables"];
export type TableName = keyof Tables;

export interface PaginationOptions {
  page?: number;
  size?: number;
  sort?: string;
}

export interface FilterOptions {
  [key: string]: any;
}

export async function paginate(
  table: TableName,
  options: PaginationOptions & FilterOptions = {},
) {
  const { page = 0, size = 20, sort = "created_at", ...filters } = options;
  const supabaseAdmin = await createClient();
  let query: any = supabaseAdmin
    .from(table as string)
    .select("*", { count: "exact" });

  // Apply filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (typeof value === "object" && !Array.isArray(value)) {
        // Handle complex filters (e.g., range queries)
        if (value.gte !== undefined) query = query.gte(key, value.gte);
        if (value.lte !== undefined) query = query.lte(key, value.lte);
        if (value.gt !== undefined) query = query.gt(key, value.gt);
        if (value.lt !== undefined) query = query.lt(key, value.lt);
      } else {
        query = query.eq(key, value);
      }
    }
  });

  // Apply sorting
  const [sortField, sortOrder] = sort.split(",");
  const ascending = sortOrder?.toLowerCase() === "asc";
  query = query.order(sortField || "created_at", { ascending });

  // Apply pagination
  query = query.range(page * size, (page + 1) * size - 1);

  const { data, count, error } = await query;

  if (error) throw error;

  return {
    content: data || [],
    totalElements: count || 0,
    totalPages: Math.ceil((count || 0) / size),
    currentPage: page,
    pageSize: size,
    hasNext: page < Math.ceil((count || 0) / size) - 1,
    hasPrevious: page > 0,
  };
}

export async function findById(table: TableName, id: string): Promise<any> {
  const supabaseAdmin = await createClient();
  const { data, error } = await (supabaseAdmin.from(table as string) as any)
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // No rows found
    throw error;
  }

  return data;
}

export async function create(table: TableName, payload: any): Promise<any> {
  const supabaseAdmin = await createClient();
  const { data, error } = await (supabaseAdmin.from(table as string) as any)
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function update(
  table: TableName,
  id: string,
  payload: any,
): Promise<any> {
  const supabaseAdmin = await createClient();
  const { data, error } = await (supabaseAdmin.from(table as string) as any)
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteById(table: TableName, id: string): Promise<void> {
  const supabaseAdmin = await createClient();
  const { error } = await (supabaseAdmin.from(table as string) as any)
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function countWhere<T extends TableName>(
  table: T,
  filters: FilterOptions,
): Promise<number> {
  const supabaseAdmin = await createClient();
  let query = supabaseAdmin.from(table).select("*", { count: "exact" });

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value);
    }
  });

  const { count, error } = await query;

  if (error) throw error;
  return count || 0;
}
