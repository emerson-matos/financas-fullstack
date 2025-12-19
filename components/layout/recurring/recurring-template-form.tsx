"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useAccounts } from "@/hooks/use-accounts";
import { useCategories } from "@/hooks/use-categories";
import { useToast } from "@/hooks/use-toast";
import {
  useCreateRecurringTemplate,
  useRecurringTemplate,
  useUpdateRecurringTemplate,
  useDeleteRecurringTemplate,
} from "@/hooks/use-recurring";
import {
  recurringTemplateFormSchema,
  type RecurringTemplateFormValues,
} from "@/lib/schemas/recurring-form";
import { cn } from "@/lib/utils";

interface RecurringTemplateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId?: string;
  onSuccess?: () => void;
}

export function RecurringTemplateForm({
  open,
  onOpenChange,
  templateId,
  onSuccess,
}: RecurringTemplateFormProps) {
  const { toast } = useToast();
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();

  const { data: template, isLoading: isTemplateLoading } = useRecurringTemplate(
    templateId || "",
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

  useEffect(() => {
    if (template) {
      form.reset({
        name: template.name,
        description: template.description || "",
        amount: Math.abs(template.amount),
        currency: template.currency,
        kind: template.kind,
        account_id: template.account_id,
        category_id: template.category_id || "",
        recurrence_rule: template.recurrence_rule,
        next_occurrence: template.next_occurrence
          ? new Date(template.next_occurrence)
          : new Date(),
        is_active: template.is_active,
      });
    } else {
      form.reset({
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
      });
    }
  }, [template, form]);

  const onSubmit = async (values: RecurringTemplateFormValues) => {
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
            onOpenChange(false);
            onSuccess?.();
          },
        },
      );
    } else {
      createTemplate(payload, {
        onSuccess: () => {
          toast({ title: "Template criado com sucesso!" });
          onOpenChange(false);
          onSuccess?.();
        },
      });
    }
  };

  const handleDelete = () => {
    if (!templateId) return;
    if (confirm("Tem certeza que deseja excluir este template?")) {
      deleteTemplate(templateId, {
        onSuccess: () => {
          toast({ title: "Template excluído com sucesso!" });
          onOpenChange(false);
          onSuccess?.();
        },
      });
    }
  };

  const isSubmitting = isCreating || isUpdating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {templateId
              ? "Editar Template Recorrente"
              : "Novo Template Recorrente"}
          </DialogTitle>
          <DialogDescription>
            Configure os detalhes da sua transação automática.
          </DialogDescription>
        </DialogHeader>

        {isTemplateLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Nome</FieldLabel>
                <Input
                  {...form.register("name")}
                  placeholder="Ex: Aluguel, Netflix..."
                />
                <FieldError errors={[form.formState.errors.name]} />
              </Field>

              <Field>
                <FieldLabel>Tipo</FieldLabel>
                <Select
                  onValueChange={(v) =>
                    form.setValue(
                      "kind",
                      v as RecurringTemplateFormValues["kind"],
                    )
                  }
                  value={form.watch("kind")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DEBIT">Débito</SelectItem>
                    <SelectItem value="CREDIT">Crédito</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError errors={[form.formState.errors.kind]} />
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Field className="col-span-2">
                <FieldLabel>Valor</FieldLabel>
                <Input
                  type="number"
                  step="0.01"
                  {...form.register("amount", { valueAsNumber: true })}
                />
                <FieldError errors={[form.formState.errors.amount]} />
              </Field>

              <Field>
                <FieldLabel>Moeda</FieldLabel>
                <Select
                  onValueChange={(v) => form.setValue("currency", v)}
                  value={form.watch("currency")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRL">BRL</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Conta</FieldLabel>
                <Select
                  onValueChange={(v) => form.setValue("account_id", v)}
                  value={form.watch("account_id")}
                >
                  <SelectTrigger>
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
                <FieldError errors={[form.formState.errors.account_id]} />
              </Field>

              <Field>
                <FieldLabel>Categoria</FieldLabel>
                <Select
                  onValueChange={(v) => form.setValue("category_id", v)}
                  value={form.watch("category_id")}
                >
                  <SelectTrigger>
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
              </Field>
            </div>

            <Field>
              <FieldLabel>Regra de Recorrência (RRULE)</FieldLabel>
              <Input
                {...form.register("recurrence_rule")}
                placeholder="FREQ=MONTHLY;BYMONTHDAY=1"
              />
              <p className="text-[0.7rem] text-muted-foreground">
                Use o formato iCal RRULE. Ex: FREQ=MONTHLY;BYMONTHDAY=15 (Todo
                dia 15 do mês)
              </p>
              <FieldError errors={[form.formState.errors.recurrence_rule]} />
            </Field>

            <Field>
              <FieldLabel>Próxima Ocorrência</FieldLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.watch("next_occurrence") && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.watch("next_occurrence") ? (
                      format(form.watch("next_occurrence"), "PPP", {
                        locale: ptBR,
                      })
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={form.watch("next_occurrence")}
                    onSelect={(date) =>
                      date && form.setValue("next_occurrence", date)
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FieldError errors={[form.formState.errors.next_occurrence]} />
            </Field>

            <Field>
              <FieldLabel>Descrição</FieldLabel>
              <Textarea {...form.register("description")} />
            </Field>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={form.watch("is_active")}
                onCheckedChange={(checked) =>
                  form.setValue("is_active", !!checked)
                }
              />
              <label
                htmlFor="is_active"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Template Ativo
              </label>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              {templateId && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  Excluir
                </Button>
              )}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {templateId ? "Salvar" : "Criar"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
