"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PlusCircle, PlusIcon, Save } from "lucide-react";
import * as React from "react";
import { useEffect, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
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
import { useCreateAccount, useUpdateAccount } from "@/hooks/use-accounts";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import type { Account } from "@/lib/types";

const formSchema = z.object({
  initial_amount: z.number().optional(),
  identification: z
    .string()
    .min(2, "Identificação deve ter pelo menos 2 caracteres")
    .max(50, "Identificação deve ter no máximo 50 caracteres"),
  currency: z.string().min(3).max(3),
  kind: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const currencies = [
  { value: "BRL", label: "Real Brasileiro (BRL)" },
  { value: "USD", label: "Dólar Americano (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "Libra Esterlina (GBP)" },
] as const;

const accountKinds = [
  { value: "CHECKING", label: "Conta Corrente" },
  { value: "SAVINGS", label: "Poupança" },
  { value: "CREDIT_CARD", label: "Cartão de Crédito" },
  { value: "INVESTMENT", label: "Investimento" },
  { value: "CASH", label: "Dinheiro" },
  { value: "OTHER", label: "Outro" },
] as const;

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
      kind: "",
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
        kind: defaultValues.kind || "",
      });
    }
  }, [defaultValues, form]);

  const handleSubmit = (values: FormValues) => {
    onSubmit(values);
    if (mode === "create") {
      form.reset();
    }
  };

  const isEditMode = mode === "edit";

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
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        )}
      </FieldGroup>

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 space-y-2 space-y-reverse sm:space-y-0">
        {onClose && (
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
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
            <>
              <PlusCircle className="mr-2 h-4 w-4" />
              Criar conta
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export function CreateAccount() {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = React.useState(false);
  const { toast } = useToast();
  const createAccountMutation = useCreateAccount();
  const isMobile = useIsMobile();

  function handleSubmit(values: FormValues) {
    startTransition(async () => {
      try {
        const accountData = {
          identification: values.identification,
          initial_amount: values.initial_amount,
          currency: values.currency,
          kind: values.kind,
        };
        await createAccountMutation.mutateAsync(accountData);
        setIsOpen(false);
        toast({
          title: "Conta criada com sucesso!",
          description: `A conta "${values.identification}" foi criada e já está disponível.`,
        });
      } catch (error) {
        console.error("Failed to create account:", error);
        toast({
          title: "Erro ao criar conta",
          description: "Não foi possível criar a conta. Tente novamente.",
          variant: "destructive",
        });
      }
    });
  }

  const isLoading = isPending || createAccountMutation.isPending;

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          <Button size="sm" className="h-9">
            <PlusIcon className="h-4 w-4 mr-2" />
            Nova Conta
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Nova Conta</DrawerTitle>
            <DrawerDescription>
              Adicione uma nova conta financeira ao seu portfólio
            </DrawerDescription>
          </DrawerHeader>
          <AccountForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            onClose={() => setIsOpen(false)}
            mode="create"
          />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nova Conta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Conta</DialogTitle>
          <DialogDescription>
            Adicione uma nova conta financeira ao seu portfólio
          </DialogDescription>
        </DialogHeader>
        <AccountForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onClose={() => setIsOpen(false)}
          mode="create"
        />
      </DialogContent>
    </Dialog>
  );
}
