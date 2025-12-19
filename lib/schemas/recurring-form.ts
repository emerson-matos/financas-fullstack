import { z } from "zod";

export const recurringTemplateFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  amount: z.number().min(0.01, "Valor deve ser maior que zero"),
  currency: z.string().min(1, "Moeda é obrigatória"),
  kind: z.enum(["DEBIT", "CREDIT", "TRANSFER", "UNKNOWN"]),
  account_id: z.string().min(1, "Conta é obrigatória"),
  category_id: z.string().optional(),
  recurrence_rule: z.string().min(1, "Regra de recorrência é obrigatória"),
  next_occurrence: z.date(),
  is_active: z.boolean(),
});

export type RecurringTemplateFormValues = z.infer<
  typeof recurringTemplateFormSchema
>;

export const defaultRecurringTemplateFormValues: Partial<RecurringTemplateFormValues> =
  {
    currency: "BRL",
    kind: "DEBIT",
    is_active: true,
    next_occurrence: new Date(),
  };
