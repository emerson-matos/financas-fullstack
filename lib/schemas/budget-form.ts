import { z } from "zod";

export const budgetFormSchema = z
  .object({
    name: z.string().min(1, "Budget name is required"),
    start_date: z.date({
      message: "Start date is required",
    }),
    end_date: z.date({
      message: "End date is required",
    }),
    is_active: z.boolean(),
    budget_items: z
      .array(
        z.object({
          category_id: z.string().min(1, "Category is required"),
          amount: z
            .string()
            .refine(
              (val) =>
                !Number.isNaN(Number.parseFloat(val)) &&
                Number.parseFloat(val) >= 0,
              "Amount must be a positive number",
            ),
        }),
      )
      .min(1, "At least one budget item is required"),
  })
  .refine((data) => data.end_date > data.start_date, {
    message: "End date must be after start date",
    path: ["end_date"],
  });

export type BudgetFormValues = z.infer<typeof budgetFormSchema>;
