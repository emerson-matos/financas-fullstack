"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { useEffect, useTransition } from "react";
import {
  Controller,
  useFieldArray,
  useForm,
  type Control,
} from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import {
  useBudget,
  useCreateBudget,
  useUpdateBudget,
} from "@/hooks/use-budgets";
import { useCategories } from "@/hooks/use-categories";
import { useToast } from "@/hooks/use-toast";

import {
  budgetFormSchema,
  type BudgetFormValues,
} from "@/lib/schemas/budget-form";
import type {
  BudgetCreatePayload,
  BudgetFormProps,
  Category,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { CategoryBadge } from "@/components/category-badge";

/* -------------------------------------------------------------------------- */
/* Defaults                                                                    */
/* -------------------------------------------------------------------------- */

const createDefaultValues = (): BudgetFormValues => ({
  name: "",
  start_date: new Date(),
  end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)),
  is_active: true,
  budget_items: [{ category_id: "", amount: "" }],
});

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

export function BudgetForm({
  open,
  onOpenChange,
  budgetId,
  onSuccess,
}: BudgetFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const { data: categories = [] } = useCategories();
  const { data: budget, isLoading: isLoadingBudget } = useBudget(
    budgetId ?? "",
  );

  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: createDefaultValues(),
    mode: "onSubmit",
  });

  const { control, reset, handleSubmit } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "budget_items",
  });

  /* ------------------------------------------------------------------------ */
  /* Effects                                                                  */
  /* ------------------------------------------------------------------------ */

  // Reset when dialog opens (create mode)
  useEffect(() => {
    if (open && !budgetId) {
      reset(createDefaultValues());
    }
    if (!open || !budgetId || !budget || isLoadingBudget) return;

    reset({
      name: budget.name,
      start_date: new Date(budget.start_date),
      end_date: new Date(budget.end_date),
      is_active: budget.is_active,
      budget_items: budget.budget_items.map((item) => ({
        category_id:
          categories.find((c) => c.name === item.category.name)?.id ?? "",
        amount: item.amount != null ? String(item.amount) : "",
      })),
    });
  }, [open, budgetId, budget, isLoadingBudget, categories, reset]);

  /* ------------------------------------------------------------------------ */
  /* Submit                                                                   */
  /* ------------------------------------------------------------------------ */

  function onSubmit(values: BudgetFormValues) {
    startTransition(() => {
      const payload: BudgetCreatePayload = {
        name: values.name,
        start_date: values.start_date,
        end_date: values.end_date,
        is_active: values.is_active,
        budget_items: values.budget_items.map((item) => ({
          category_id: item.category_id,
          amount: Number(item.amount),
        })),
      };

      const mutation = budgetId
        ? updateBudget.mutateAsync({ id: budgetId, data: payload })
        : createBudget.mutateAsync(payload);

      mutation
        .then(() => {
          toast({
            title: budgetId ? "Budget updated" : "Budget created",
            description: "Your changes have been saved successfully.",
          });
          onOpenChange(false);
          onSuccess?.();
        })
        .catch(() => {
          toast({
            title: "Something went wrong",
            description: "Please try again.",
            variant: "destructive",
          });
        });
    });
  }

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {budgetId ? "Edit Budget" : "Create Budget"}
          </DialogTitle>
          <DialogDescription>
            {budgetId
              ? "Update your budget and category allocations."
              : "Create a new budget to track your spending."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                control={control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Nome do Orçamento</FieldLabel>
                    <Input {...field} placeholder="Orçamento mensal" />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Controller
                control={control}
                name="is_active"
                render={({ field }) => (
                  <Field className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <FieldLabel>Active</FieldLabel>
                      <FieldDescription>
                        Use this as the current budget
                      </FieldDescription>
                    </div>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </Field>
                )}
              />
            </div>

            <DateField
              control={control}
              name="start_date"
              label="Data de início"
            />
            <DateField
              control={control}
              name="end_date"
              label="Data de término"
            />
          </FieldGroup>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium">Categories</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ category_id: "", amount: "" })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <BudgetItemRow
                  key={field.id}
                  index={index}
                  control={control}
                  categories={categories}
                  canRemove={fields.length > 1}
                  onRemove={() => remove(index)}
                />
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Saving…"
                : budgetId
                  ? "Update budget"
                  : "Create budget"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/* Subcomponents                                                              */
/* -------------------------------------------------------------------------- */

function DateField({
  control,
  name,
  label,
}: {
  control: Control<BudgetFormValues>;
  name: "start_date" | "end_date";
  label: string;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel>{label}</FieldLabel>
          <Popover modal>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !field.value && "text-muted-foreground",
                )}
              >
                {field.value
                  ? format(field.value, "PPP", { locale: ptBR })
                  : "Selecione uma data"}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={field.onChange}
              />
            </PopoverContent>
          </Popover>
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  );
}

function BudgetItemRow({
  index,
  control,
  categories,
  onRemove,
  canRemove,
}: {
  index: number;
  control: Control<BudgetFormValues>;
  categories: Category[];
  onRemove: () => void;
  canRemove: boolean;
}) {
  return (
    <div className="flex items-end gap-4 rounded-lg border p-4">
      <Controller
        control={control}
        name={`budget_items.${index}.category_id`}
        render={({ field, fieldState }) => (
          <Field className="flex-1" data-invalid={fieldState.invalid}>
            <FieldLabel>Categoria</FieldLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} <CategoryBadge name={c.name} />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      <Controller
        control={control}
        name={`budget_items.${index}.amount`}
        render={({ field, fieldState }) => (
          <Field className="w-32" data-invalid={fieldState.invalid}>
            <FieldLabel>Quantidade</FieldLabel>
            <Input {...field} type="number" step="0.01" placeholder="0.00" />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={onRemove}
        disabled={!canRemove}
        aria-label="Remover categoria"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
