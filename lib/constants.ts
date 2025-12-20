/**
 * Shared constants for the application
 * Centralizes reusable options for forms and UI components
 */

// Account type options
export const accountKinds = [
  { value: "CHECKING", label: "Conta Corrente" },
  { value: "SAVINGS", label: "Poupança" },
  { value: "CREDIT_CARD", label: "Cartão de Crédito" },
  { value: "INVESTMENT", label: "Investimento" },
  { value: "CASH", label: "Dinheiro" },
] as const;

export type AccountKind = (typeof accountKinds)[number]["value"];

// Currency options
export const currencies = [
  { value: "BRL", label: "Real Brasileiro (BRL)" },
  { value: "USD", label: "Dólar Americano (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "Libra Esterlina (GBP)" },
  { value: "CAD", label: "Dólar Canadense (CAD)" },
] as const;

export type Currency = (typeof currencies)[number]["value"];

// Default values for onboarding
export const defaultFirstAccount = {
  name: "Carteira",
  kind: "CASH" as AccountKind,
  currency: "BRL" as Currency,
  initialAmount: 0,
};
