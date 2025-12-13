"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import type { Control } from "react-hook-form";
import { Controller, useFieldArray, useForm } from "react-hook-form";
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
  type BudgetFormValues,
  budgetFormSchema,
} from "@/lib/schemas/budget-form";
import type {
  BudgetCreatePayload,
  BudgetFormProps,
  Category,
} from "@/lib/types";
import { cn } from "@/lib/utils";

interface BudgetItemFieldProps {
  index: number;
  categories: Array<Category>;
  onRemove: () => void;
  canRemove: boolean;
}

export function BudgetForm({
  open,
  onOpenChange,
  budgetId,
  onSuccess,
}: BudgetFormProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const { data: categories } = useCategories();
  const { data: budgetData, isLoading: isLoadingBudget } = useBudget(
    budgetId || "",
  );
  const createBudgetMutation = useCreateBudget();
  const updateBudgetMutation = useUpdateBudget();

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      name: "",
      start_date: new Date(),
      end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      is_active: true,
      budget_items: [{ category_id: "", amount: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "budget_items",
  });

  // Reset form when dialog opens/closes or budgetId changes
  useEffect(() => {
    if (!open) {
      // Reset to defaults when dialog closes
      return;
    }

    if (!budgetId) {
      // Creating new budget - reset to defaults
      form.reset({
        name: "",
        start_date: new Date(),
        end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        is_active: true,
        budget_items: [{ category_id: "", amount: "" }],
      });
    }
  }, [open, budgetId, form]);

  // Load existing budget data when editing
  useEffect(() => {
    if (budgetId && budgetData && !isLoadingBudget && categories) {
      form.reset({
        name: budgetData.name,
        start_date: new Date(budgetData.start_date),
        end_date: new Date(budgetData.end_date),
        is_active: budgetData.is_active,
        budget_items: budgetData.budget_items.map(
          (item: { amount: number | null; category: { name: string } }) => {
            const category = categories?.find(
              (c: Category) => c.name === item.category.name,
            );
            return {
              category_id: category?.id || "",
              amount: String(Number(item.amount)),
            };
          },
        ),
      });
    }
  }, [budgetData, isLoadingBudget, form, categories]);

  function onSubmit(values: BudgetFormValues) {
    startTransition(() => {
      setError(null);
      const budgetPayload: BudgetCreatePayload = {
        name: values.name,
        start_date: values.start_date,
        end_date: values.end_date,
        is_active: values.is_active,
        budget_items: values.budget_items.map((item) => ({
          category_id: item.category_id,
          amount: Number.parseFloat(item.amount),
        })),
      };

      if (budgetId) {
        updateBudgetMutation.mutate(
          { id: budgetId, data: budgetPayload },
          {
            onSuccess: () => {
              toast({
                title: "Budget Updated",
                description: "Your budget has been successfully updated.",
              });
              onOpenChange(false);
              onSuccess?.();
            },
            onError: (err) => {
              setError(err.message);
              toast({
                title: "Error",
                description: "Failed to update budget. Please try again.",
                variant: "destructive",
              });
            },
          },
        );
      } else {
        createBudgetMutation.mutate(budgetPayload, {
          onSuccess: () => {
            toast({
              title: "Budget Created",
              description: "Your budget has been successfully created.",
            });
            onOpenChange(false);
            onSuccess?.();
          },
          onError: (err) => {
            setError(err.message);
            toast({
              title: "Error",
              description: "Failed to create budget. Please try again.",
              variant: "destructive",
            });
          },
        });
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {budgetId ? "Edit Budget" : "Create New Budget"}
          </DialogTitle>
          <DialogDescription>
            {budgetId
              ? "Update your budget details and category allocations."
              : "Set up a new budget with category allocations to track your spending."}
          </DialogDescription>
        </DialogHeader>

        {/* FormProvider needed for useFormContext in BudgetItemField */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FieldGroup>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="budget-name">Budget Name</FieldLabel>
                    <Input
                      {...field}
                      id="budget-name"
                      placeholder="Monthly Budget"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <Field className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FieldLabel>Active Budget</FieldLabel>
                      <FieldDescription>
                        Set this as your current active budget
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

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Controller
                control={form.control}
                name="start_date"
                render={({ field, fieldState }) => (
                  <Field
                    className="flex flex-col"
                    data-invalid={fieldState.invalid}
                  >
                    <FieldLabel>Start Date</FieldLabel>
                    <Popover modal>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                          type="button"
                          aria-invalid={fieldState.invalid}
                        >
                          {field.value ? (
                            format(field.value, "MM/dd/yyyy")
                          ) : (
                            <span>Select start date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                        />
                      </PopoverContent>
                    </Popover>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="end_date"
                render={({ field, fieldState }) => (
                  <Field
                    className="flex flex-col"
                    data-invalid={fieldState.invalid}
                  >
                    <FieldLabel>End Date</FieldLabel>
                    <Popover modal>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                          type="button"
                          aria-invalid={fieldState.invalid}
                        >
                          {field.value ? (
                            format(field.value, "MM/dd/yyyy")
                          ) : (
                            <span>Select end date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                        />
                      </PopoverContent>
                    </Popover>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
          </FieldGroup>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium">Budget Categories</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ category_id: "", amount: "" })}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </div>
            <div className="space-y-4">
              {/* Need FormProvider wrapper for useFormContext in child */}
              {fields.map((field, index) => (
                <BudgetItemFieldWrapper
                  key={field.id}
                  index={index}
                  categories={categories || []}
                  onRemove={() => remove(index)}
                  canRemove={fields.length > 1}
                  control={form.control}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
              <p className="text-sm font-medium text-destructive">{error}</p>
            </div>
          )}

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
                ? "Saving..."
                : budgetId
                  ? "Update Budget"
                  : "Create Budget"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Wrapper to pass control directly since we're not using FormProvider
function BudgetItemFieldWrapper({
  index,
  categories,
  onRemove,
  canRemove,
  control,
}: BudgetItemFieldProps & { control: Control<BudgetFormValues> }) {
  return (
    <div className="flex items-end gap-4 p-4 border rounded-lg">
      <Controller
        control={control}
        name={`budget_items.${index}.category_id`}
        render={({ field, fieldState }) => (
          <Field className="flex-1" data-invalid={fieldState.invalid}>
            <FieldLabel className={index !== 0 ? "sr-only" : undefined}>
              Category
            </FieldLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              value={field.value}
            >
              <SelectTrigger aria-invalid={fieldState.invalid}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Controller
        control={control}
        name={`budget_items.${index}.amount`}
        render={({ field, fieldState }) => (
          <Field className="w-1/3" data-invalid={fieldState.invalid}>
            <FieldLabel className={index !== 0 ? "sr-only" : undefined}>
              Amount
            </FieldLabel>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                $
              </span>
              <Input
                {...field}
                type="number"
                step="0.01"
                placeholder="0.00"
                className="pl-8"
                aria-invalid={fieldState.invalid}
              />
            </div>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        disabled={!canRemove}
        className="mb-1"
        aria-label="Remove budget item"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
