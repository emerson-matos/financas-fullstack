import { z } from "zod";

export const defaultTransactionFormValues = {
  account_id: "",
  category_id: "",
  name: "",
  amount: 0,
  description: "",
  transacted_at: new Date(),
  kind: "DEBIT" as "DEBIT" | "CREDIT" | "TRANSFER" | "UNKNOWN",
  currency: "BRL",
  destination_account_id: "",
};

export const transactionFormSchema = z
  .object({
    account_id: z
      .string()
      .min(1, { message: "Você precisa selecionar a conta da transação" }),
    category_id: z.string().optional(),
    name: z.string().optional(),
    amount: z
      .number()
      .positive({ message: "O valor precisa ser maior que zero" }),
    description: z.string().min(1, { message: "Descrição é necessária" }),
    transacted_at: z.date({
      message: "Uma data e hora precisam ser selecionadas",
    }),
    kind: z.enum(["DEBIT", "CREDIT", "TRANSFER", "UNKNOWN"]),
    currency: z
      .string()
      .min(1, { message: "Uma moeda precisa ser selecionada" }),
    destination_account_id: z.string().optional(),
  })
  .refine(
    (data) => {
      // For TRANSFER, destination_account_id is required
      if (data.kind === "TRANSFER") {
        return !!data.destination_account_id;
      }
      return true;
    },
    {
      message: "Você precisa selecionar a conta de destino para transferências",
      path: ["destination_account_id"],
    },
  )
  .refine(
    (data) => {
      // For TRANSFER, destination_account_id must be different from account_id
      if (data.kind === "TRANSFER" && data.destination_account_id) {
        return data.destination_account_id !== data.account_id;
      }
      return true;
    },
    {
      message: "A conta de destino deve ser diferente da conta de origem",
      path: ["destination_account_id"],
    },
  );

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;
