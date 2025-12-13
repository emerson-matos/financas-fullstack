import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs));
}

// Format currency for the tooltip
export const formatCurrency = (value: number, currency?: string) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    // FIXME: fix the currency
    currency: currency ?? "BRL",
    minimumFractionDigits: 2,
  }).format(value);
};

// This check can be removed, it is just for tutorial purposes
export const hasEnvVars =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY;
