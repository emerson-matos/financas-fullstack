"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import * as React from "react";
import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { accountKinds, currencies, type AccountKind } from "@/lib/constants";

const accountKindValues = accountKinds.map((k) => k.value) as [
  AccountKind,
  ...AccountKind[],
];

const formSchema = z.object({
  initial_amount: z.number().optional(),
  identification: z
    .string()
    .min(2, "Identificação deve ter pelo menos 2 caracteres")
    .max(50, "Identificação deve ter no máximo 50 caracteres"),
  currency: z.string().min(3).max(3),
  kind: z.enum(accountKindValues).optional(),
  // Credit card specific fields
  credit_limit: z.number().optional(),
  bill_closing_day: z.number().min(1).max(31).optional(),
  bill_due_day: z.number().min(1).max(31).optional(),
});

export type FormValues = z.infer<typeof formSchema>;

interface AccountFormProps {
  onSubmit: (values: FormValues) => void;
  isLoading: boolean;
  onClose?: () => void;
  defaultValues?: Partial<FormValues>;
  mode?: "create" | "edit";
}

// Shared form component for create and edit
export function AccountForm({
  onSubmit,
  isLoading,
  onClose,
  defaultValues,
  mode = "create",
}: AccountFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      identification: "",
      initial_amount: 0,
      currency: "BRL",
      kind: undefined,
      credit_limit: 0,
      bill_closing_day: 5,
      bill_due_day: 15,
      ...defaultValues,
    },
  });

  // Reset form when defaultValues change (for edit mode)
  useEffect(() => {
    if (defaultValues) {
      form.reset({
        identification: defaultValues.identification || "",
        initial_amount: defaultValues.initial_amount || 0,
        currency: defaultValues.currency || "BRL",
        kind: defaultValues.kind || undefined,
        credit_limit: defaultValues.credit_limit || 0,
        bill_closing_day: defaultValues.bill_closing_day || 5,
        bill_due_day: defaultValues.bill_due_day || 15,
      });
    }
  }, [defaultValues, form]);

  const handleSubmit = (values: FormValues) => {
    onSubmit(values);
    if (mode === "create") {
      form.reset();
      // Ensure default values are re-set if needed, or just standard reset
      form.setValue("currency", "BRL");
      form.setValue("initial_amount", 0);
    }
  };

  const isEditMode = mode === "edit";
  const kind = useWatch({
    control: form.control,
    name: "kind",
  });

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className="mb-8 space-y-8 p-4"
    >
      <FieldGroup>
        <Controller
          control={form.control}
          name="identification"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="account-identification">
                Identificação da Conta
              </FieldLabel>
              <Input
                {...field}
                id="account-identification"
                placeholder="Ex: Nubank, Itaú, Conta Poupança..."
                autoComplete="off"
                aria-invalid={fieldState.invalid}
              />
              <FieldDescription>
                Nome ou descrição para identificar esta conta
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="currency"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="account-currency">Moeda</FieldLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger
                  id="account-currency"
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue placeholder="Selecione a moeda" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldDescription>Moeda principal desta conta</FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          control={form.control}
          name="kind"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="account-kind">Tipo de Conta</FieldLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <SelectTrigger
                  id="account-kind"
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {accountKinds.map((kind) => (
                    <SelectItem key={kind.value} value={kind.value}>
                      {kind.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldDescription>Tipo ou categoria da conta</FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {!isEditMode && (
          <Controller
            control={form.control}
            name="initial_amount"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="account-initial-amount">
                  Saldo Inicial
                </FieldLabel>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  id="account-initial-amount"
                  value={field.value}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const value =
                      e.target.value === "" ? 0 : Number(e.target.value);
                    field.onChange(value);
                  }}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  aria-invalid={fieldState.invalid}
                />
                <FieldDescription>
                  Saldo atual desta conta (positivo para crédito, negativo para
                  débito/empréstimos)
                </FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        )}

        {kind === "CREDIT_CARD" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Controller
              control={form.control}
              name="credit_limit"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="account-credit-limit">
                    Limite de Crédito
                  </FieldLabel>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    id="account-credit-limit"
                    value={field.value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const value =
                        e.target.value === "" ? 0 : Number(e.target.value);
                      field.onChange(value);
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
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
              name="bill_closing_day"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="account-bill-closing-day">
                    Fechamento (Dia)
                  </FieldLabel>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    id="account-bill-closing-day"
                    value={field.value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const value =
                        e.target.value === "" ? 1 : Number(e.target.value);
                      field.onChange(value);
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
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
              name="bill_due_day"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="account-bill-due-day">
                    Vencimento (Dia)
                  </FieldLabel>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    id="account-bill-due-day"
                    value={field.value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const value =
                        e.target.value === "" ? 1 : Number(e.target.value);
                      field.onChange(value);
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </div>
        )}
      </FieldGroup>

      <div className="flex flex-col-reverse justify-end gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-col-reverse sm:flex-row sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0">
          {onClose && (
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? "Salvando..." : "Criando conta..."}
              </>
            ) : isEditMode ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </>
            ) : (
              <>Criar conta</>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
