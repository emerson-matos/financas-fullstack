import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

export type Tables = Database["thc"]["Tables"];
export type TableName = keyof Tables;

type Row<T extends TableName> = Tables[T]["Row"];
type Insert<T extends TableName> = Tables[T]["Insert"];
type Update<T extends TableName> = Tables[T]["Update"];

export interface PaginationOptions {
  page?: number;
  size?: number;
  sort?: string;
}

type Primitive = string | number | boolean | null;

type RangeFilter<T extends Primitive = Primitive> = {
  gte?: T;
  lte?: T;
  gt?: T;
  lt?: T;
};

export type FilterValue = Primitive | RangeFilter;

export type FilterOptions = Record<string, FilterValue>;

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export async function paginate<T extends TableName>(
  table: T,
  options: PaginationOptions & FilterOptions = {},
): Promise<Page<Row<T>>> {
  const { page = 0, size = 20, sort = "created_at", ...filters } = options;

  const supabaseAdmin = await createClient();

  let query = supabaseAdmin.from(table).select("*", { count: "exact" });

  Object.entries(filters).forEach(([key, value]) => {
    if (value == null) return;

    if (typeof value === "object" && !Array.isArray(value)) {
      if (value.gte !== undefined) query = query.gte(key, value.gte);
      if (value.lte !== undefined) query = query.lte(key, value.lte);
      if (value.gt !== undefined) query = query.gt(key, value.gt);
      if (value.lt !== undefined) query = query.lt(key, value.lt);
    } else {
      query = query.eq(key, value);
    }
  });

  const [sortField, sortOrder] = sort.split(",");
  query = query.order(sortField ?? "created_at", {
    ascending: sortOrder?.toLowerCase() === "asc",
  });

  query = query.range(page * size, page * size + size - 1);

  const { data, count, error } = await query;

  if (error) throw error;

  const totalPages = Math.ceil((count ?? 0) / size);

  return {
    content: data ?? [],
    totalElements: count ?? 0,
    totalPages,
    currentPage: page,
    pageSize: size,
    hasNext: page < totalPages - 1,
    hasPrevious: page > 0,
  };
}

export async function findById<T extends TableName>(
  table: T,
  id: string,
): Promise<Row<T> | null> {
  const supabaseAdmin = await createClient();

  const { data, error } = await supabaseAdmin
    .from(table)
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data;
}

export async function create<T extends TableName>(
  table: T,
  payload: Insert<T>,
): Promise<Row<T>> {
  const supabaseAdmin = await createClient();

  const { data, error } = await supabaseAdmin
    .from(table)
    .insert(payload)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function update<T extends TableName>(
  table: T,
  id: string,
  payload: Update<T>,
): Promise<Row<T>> {
  const supabaseAdmin = await createClient();

  const { data, error } = await supabaseAdmin
    .from(table)
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteById<T extends TableName>(
  table: T,
  id: string,
): Promise<void> {
  const supabaseAdmin = await createClient();

  const { error } = await supabaseAdmin.from(table).delete().eq("id", id);

  if (error) throw error;
}

export async function countWhere<T extends TableName>(
  table: T,
  filters: FilterOptions,
): Promise<number> {
  const supabaseAdmin = await createClient();

  let query = supabaseAdmin.from(table).select("*", { count: "exact" });

  Object.entries(filters).forEach(([key, value]) => {
    if (value != null && typeof value !== "object") {
      query = query.eq(key, value);
    }
  });

  const { count, error } = await query;

  if (error) throw error;
  return count ?? 0;
}
