"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

import { useAccounts } from "@/hooks/use-accounts";
import { useCategories } from "@/hooks/use-categories";
import { useToast } from "@/hooks/use-toast";
import {
  useCreateRecurringTemplate,
  useDeleteRecurringTemplate,
  useRecurringTemplate,
  useUpdateRecurringTemplate,
} from "@/hooks/use-recurring";
import {
  recurringTemplateFormSchema,
  type RecurringTemplateFormValues,
} from "@/lib/schemas/recurring-form";
import { cn } from "@/lib/utils";

interface RecurringTemplateFormProps {
  templateId?: string;
  onSuccess?: () => void;
}

export function RecurringTemplateForm({
  templateId,
  onSuccess,
}: RecurringTemplateFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();
  const { data: template, isLoading: isTemplateLoading } = useRecurringTemplate(
    templateId ?? "",
  );

  const { mutate: createTemplate, isPending: isCreating } =
    useCreateRecurringTemplate();
  const { mutate: updateTemplate, isPending: isUpdating } =
    useUpdateRecurringTemplate();
  const { mutate: deleteTemplate, isPending: isDeleting } =
    useDeleteRecurringTemplate();

  const form = useForm<RecurringTemplateFormValues>({
    resolver: zodResolver(recurringTemplateFormSchema),
    defaultValues: {
      name: "",
      description: "",
      amount: 1,
      currency: "BRL",
      kind: "DEBIT",
      account_id: "",
      category_id: "",
      recurrence_rule: "FREQ=MONTHLY;BYMONTHDAY=1",
      next_occurrence: new Date(),
      is_active: true,
    },
  });

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!template || hasInitialized.current) return;
    hasInitialized.current = true;

    form.reset({
      name: template.name,
      description: template.description ?? "",
      amount: Math.abs(template.amount),
      currency: template.currency,
      kind: template.kind,
      account_id: template.account_id ?? "",
      category_id: template.category_id ?? "",
      recurrence_rule: template.recurrence_rule,
      next_occurrence: template.next_occurrence
        ? new Date(template.next_occurrence)
        : new Date(),
      is_active: template.is_active,
    });
  }, [template, form]);

  function onSubmit(values: RecurringTemplateFormValues) {
    const payload = {
      ...values,
      accountId: values.account_id,
      categoryId: values.category_id || undefined,
      recurrenceRule: values.recurrence_rule,
      nextOccurrence: values.next_occurrence.toISOString(),
      isActive: values.is_active,
    };

    if (templateId) {
      updateTemplate(
        { id: templateId, data: payload },
        {
          onSuccess: () => {
            toast({ title: "Template atualizado com sucesso!" });
            onSuccess?.();
          },
        },
      );
    } else {
      createTemplate(payload, {
        onSuccess: () => {
          toast({ title: "Template criado com sucesso!" });
          onSuccess?.();
        },
      });
    }
  }

  function handleDelete() {
    if (!templateId) return;
    if (!confirm("Tem certeza que deseja excluir este template?")) return;

    deleteTemplate(templateId, {
      onSuccess: () => {
        toast({ title: "Template excluído com sucesso!" });
        router.push("/dashboard/recurring");
      },
    });
  }

  const isSubmitting = isCreating || isUpdating;
  const isLoading = isTemplateLoading || !accounts || !categories;

  if (isLoading) {
    return (
      <div className="space-y-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="py-4" noValidate>
      <FieldGroup>
        {/* Row 1: Name + Kind */}
        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Nome</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="Ex: Aluguel, Netflix..."
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="kind"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Tipo</FieldLabel>
                <Select
                  key={field.value}
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DEBIT">Débito</SelectItem>
                    <SelectItem value="CREDIT">Crédito</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        {/* Row 2: Amount + Currency */}
        <div className="grid grid-cols-3 gap-4">
          <Controller
            name="amount"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field className="col-span-2" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Valor</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="number"
                  step="0.01"
                  aria-invalid={fieldState.invalid}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="currency"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Moeda</FieldLabel>
                <Select
                  key={field.value}
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRL">BRL</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        {/* Row 3: Account + Category */}
        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="account_id"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Conta</FieldLabel>
                <Select
                  key={field.value}
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Selecione a conta" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts?.map(
                      (acc: { id: string; identification: string }) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.identification}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="category_id"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Categoria</FieldLabel>
                <Select
                  key={field.value}
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat: { id: string; name: string }) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        {/* Recurrence Rule */}
        <Controller
          name="recurrence_rule"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Regra de Recorrência (RRULE)
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder="FREQ=MONTHLY;BYMONTHDAY=1"
                aria-invalid={fieldState.invalid}
              />
              <FieldDescription>
                Use o formato iCal RRULE. Ex: FREQ=MONTHLY;BYMONTHDAY=15 (Todo
                dia 15 do mês)
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Next Occurrence */}
        <Controller
          name="next_occurrence"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Próxima Ocorrência</FieldLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    aria-invalid={fieldState.invalid}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !field.value && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? (
                      format(field.value, "PPP", { locale: ptBR })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => date && field.onChange(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Description */}
        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Descrição</FieldLabel>
              <Textarea
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Is Active */}
        <Controller
          name="is_active"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation="horizontal" data-invalid={fieldState.invalid}>
              <Checkbox
                id={field.name}
                name={field.name}
                checked={field.value}
                onCheckedChange={field.onChange}
                aria-invalid={fieldState.invalid}
              />
              <FieldLabel
                htmlFor={field.name}
                className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Template Ativo
              </FieldLabel>
            </Field>
          )}
        />
      </FieldGroup>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2">
        {templateId && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Excluir
          </Button>
        )}

        <div className="ml-auto flex gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {templateId ? "Salvar" : "Criar"}
          </Button>
        </div>
      </div>
    </form>
  );
}

