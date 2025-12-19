"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  ArrowRightLeftIcon,
  CalendarIcon,
  CreditCardIcon,
  HelpCircleIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from "lucide-react";
import { useEffect, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import type { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
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
import { Textarea } from "@/components/ui/textarea";
import { useAccounts } from "@/hooks/use-accounts";
import { useCategories } from "@/hooks/use-categories";
import { useToast } from "@/hooks/use-toast";
import {
  useCreateTransaction,
  useTransaction,
  useUpdateTransaction,
} from "@/hooks/use-transactions";
import {
  defaultTransactionFormValues,
  transactionFormSchema,
} from "@/lib/schemas/transaction-form";
import type { Account, Category, CreateTransactionRequest } from "@/lib/types";
import { cn } from "@/lib/utils";

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

interface TransactionFormProps {
  transactionId?: string;
  accountId?: string;
  redirect?: boolean;
}

const transactionKindConfig = {
  DEBIT: {
    icon: TrendingDownIcon,
    label: "Débito",
    description: "Dinheiro saindo da conta",
    variant: "destructive" as const,
  },
  CREDIT: {
    icon: TrendingUpIcon,
    label: "Crédito",
    description: "Dinheiro entrando na conta",
    variant: "default" as const,
  },
  TRANSFER: {
    icon: ArrowRightLeftIcon,
    label: "Transferência",
    description: "Movimento entre contas",
    variant: "secondary" as const,
  },
  UNKNOWN: {
    icon: HelpCircleIcon,
    label: "Desconhecido",
    description: "Tipo não identificado",
    variant: "outline" as const,
  },
};

function RequiredBadge() {
  return (
    <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
      obrigatório
    </Badge>
  );
}

export function TransactionForm({
  transactionId,
  accountId,
  redirect,
}: TransactionFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: transactionData, isLoading: transactionLoading } =
    useTransaction(transactionId || "");

  const { mutate: createTransaction, isPending: isCreating } =
    useCreateTransaction();
  const { mutate: updateTransaction, isPending: isUpdating } =
    useUpdateTransaction();

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      ...defaultTransactionFormValues,
      category_id: transactionData?.category_id || "",
      account_id:
        transactionData?.account?.id ||
        transactionData?.account_id ||
        accountId ||
        "",
    },
  });

  const selectedKind = useWatch({ control: form.control, name: "kind" });
  const watchedAccountId = useWatch({
    control: form.control,
    name: "account_id",
  });
  const selectedAccount = accounts?.find(
    (account: Account) => account.id === watchedAccountId,
  );

  // Filter accounts for destination (exclude source account)
  const availableDestinationAccounts = accounts?.filter(
    (account: Account) => account.id !== watchedAccountId,
  );

  // Auto-sync currency when account is selected
  useEffect(() => {
    if (selectedAccount && !transactionId) {
      form.setValue("currency", selectedAccount.currency || "BRL");
    }
  }, [selectedAccount, transactionId, form]);

  useEffect(() => {
    if (transactionData) {
      form.reset({
        account_id: transactionData.account_id,
        category_id: transactionData.category_id || "",
        name: transactionData.name || transactionData.description || "",
        amount: Math.abs(transactionData.amount),
        description: transactionData.description || "",
        transacted_date: new Date(transactionData.transacted_date),
        kind: transactionData.kind as
          | "DEBIT"
          | "CREDIT"
          | "TRANSFER"
          | "UNKNOWN",
        currency: transactionData.account?.currency || "BRL",
        destination_account_id: "",
      });
    } else if (accountId) {
      form.setValue("account_id", accountId);
    }
  }, [transactionData, accountId, form]);

  function onSubmit(values: TransactionFormValues) {
    const requestData: CreateTransactionRequest = {
      accountId: values.account_id,
      // Transfers don't have a category
      categoryId: values.kind === "TRANSFER" ? undefined : values.category_id,
      name: values.name,
      amount: values.amount,
      description: values.description || "",
      transactedDate: values.transacted_date.toISOString().split("T")[0],
      currency: values.currency,
      kind: values.kind,
      ...(values.kind === "TRANSFER" && values.destination_account_id
        ? { destinationAccountId: values.destination_account_id }
        : {}),
    };

    startTransition(() => {
      if (transactionId) {
        updateTransaction(
          { id: transactionId, data: requestData },
          {
            onSuccess: () => {
              if (redirect) {
                router.back();
              }
              toast({
                title: "Transação atualizada!",
                description: "As alterações foram salvas com sucesso.",
              });
            },
            onError: (error: unknown) => {
              const errorMessage =
                error instanceof Error
                  ? error.message
                  : "Tente novamente em alguns instantes.";
              toast({
                title: "Erro ao atualizar",
                description: errorMessage,
                variant: "destructive",
              });
            },
          },
        );
      } else {
        createTransaction(requestData, {
          onSuccess: () => {
            if (redirect) {
              router.back();
            }
            toast({
              title: "Transação criada!",
              description: "A transação foi adicionada ao seu orçamento.",
            });
            form.reset();
          },
          onError: (error: unknown) => {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Tente novamente em alguns instantes.";
            toast({
              title: "Erro ao criar transação",
              description: errorMessage,
              variant: "destructive",
            });
          },
        });
      }
    });
  }

  const isLoading = accountsLoading || categoriesLoading || transactionLoading;
  const isSubmitting = isCreating || isUpdating || isPending;

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-100"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-3">
          <div
            className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"
            aria-hidden="true"
          />
          <span className="text-muted-foreground">
            Carregando formulário...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with context */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <CreditCardIcon className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">
            {transactionId ? "Editar Transação" : "Nova Transação"}
          </h2>
        </div>
        {selectedAccount && (
          <Badge variant="outline" className="text-xs">
            Conta: {selectedAccount.identification}
          </Badge>
        )}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Essential Information */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Informações Essenciais</CardTitle>
            <CardDescription>
              Dados obrigatórios para criar a transação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Account Selection */}
            <Controller
              control={form.control}
              name="account_id"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name} className="flex items-center gap-2">
                    Conta
                    <RequiredBadge />
                  </FieldLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={
                      !!accountId ||
                      !!transactionData?.account_id ||
                      !!transactionData?.account?.id
                    }
                  >
                    <SelectTrigger
                      id={field.name}
                      className={cn(
                        "transition-colors",
                        field.value ? "border-primary/50" : "",
                      )}
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Selecione uma conta" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts?.map((account: Account) => (
                        <SelectItem key={account.id} value={account.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{account.identification}</span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {account.currency}
                            </Badge>
                          </div>
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

            {/* Transaction Type */}
            <Controller
              control={form.control}
              name="kind"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name} className="flex items-center gap-2">
                    Tipo de Transação
                    <RequiredBadge />
                  </FieldLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      id={field.name}
                      className={cn(
                        "transition-colors",
                        field.value ? "border-primary/50" : "",
                      )}
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(transactionKindConfig).map(
                        ([value, config]) => {
                          const Icon = config.icon;
                          return (
                            <SelectItem key={value} value={value}>
                              <div className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                <div className="flex flex-col">
                                  <span>{config.label}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {config.description}
                                  </span>
                                </div>
                              </div>
                            </SelectItem>
                          );
                        },
                      )}
                    </SelectContent>
                  </Select>
                  {selectedKind && (
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant={transactionKindConfig[selectedKind].variant}
                      >
                        {transactionKindConfig[selectedKind].label}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {transactionKindConfig[selectedKind].description}
                      </span>
                    </div>
                  )}
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Destination Account - Only shown for TRANSFER */}
            {selectedKind === "TRANSFER" && (
              <Controller
                control={form.control}
                name="destination_account_id"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name} className="flex items-center gap-2">
                      Conta de Destino
                      <RequiredBadge />
                    </FieldLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger
                        id={field.name}
                        className={cn(
                          "transition-colors",
                          field.value ? "border-primary/50" : "",
                        )}
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="Selecione a conta de destino" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDestinationAccounts?.map(
                          (account: Account) => (
                            <SelectItem key={account.id} value={account.id}>
                              <div className="flex items-center justify-between w-full">
                                <span>{account.identification}</span>
                                <Badge
                                  variant="outline"
                                  className="ml-2 text-xs"
                                >
                                  {account.currency}
                                </Badge>
                              </div>
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      O valor será transferido da conta de origem para esta
                      conta
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            )}

            {/* Amount and Currency */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Controller
                  control={form.control}
                  name="amount"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name} className="flex items-center gap-2">
                        Valor
                        <RequiredBadge />
                      </FieldLabel>
                      <Input
                        id={field.name}
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        className={cn(
                          "text-lg font-medium transition-colors",
                          field.value > 0 ? "border-primary/50" : "",
                        )}
                        value={field.value}
                        onChange={(e) =>
                          field.onChange(Number.parseFloat(e.target.value) || 0)
                        }
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
              <Controller
                control={form.control}
                name="currency"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Moeda</FieldLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BRL">BRL</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            {/* Date */}
            <Controller
              control={form.control}
              name="transacted_date"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name} className="flex items-center gap-2">
                    Data da Transação
                    <RequiredBadge />
                  </FieldLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id={field.name}
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal transition-colors",
                          !field.value && "text-muted-foreground",
                          field.value && "border-primary/50",
                        )}
                        aria-invalid={fieldState.invalid}
                        aria-label="Selecionar data da transação"
                      >
                        {field.value ? (
                          new Intl.DateTimeFormat("pt-br").format(field.value)
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                        <CalendarIcon
                          className="ml-auto h-4 w-4 opacity-50"
                          aria-hidden="true"
                        />
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
          </CardContent>
        </Card>

        {/* Details Section */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Detalhes</CardTitle>
            <CardDescription>
              Informações adicionais para organizar melhor suas transações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Name */}
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Nome da Transação</FieldLabel>
                  <Input
                    id={field.name}
                    {...field}
                    placeholder="Ex: Compra no supermercado, Pagamento de salário..."
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>
                    Um nome descritivo para identificar rapidamente a transação
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Category - Hidden for TRANSFER transactions */}
            {selectedKind === "TRANSFER" ? (
              <Field>
                <FieldLabel>Categoria</FieldLabel>
                <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-muted text-muted-foreground">
                  <ArrowRightLeftIcon className="h-4 w-4" />
                  <span>Transferência</span>
                </div>
                <FieldDescription>
                  Transferências não podem ter categoria alterada
                </FieldDescription>
              </Field>
            ) : (
              <Controller
                control={form.control}
                name="category_id"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Categoria</FieldLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((category: Category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      Ajuda a organizar e analisar seus gastos
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            )}

            {/* Description */}
            <Controller
              control={form.control}
              name="description"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name} className="flex items-center gap-2">
                    Descrição
                    <RequiredBadge />
                  </FieldLabel>
                  <Textarea
                    id={field.name}
                    {...field}
                    placeholder="Descreva os detalhes da transação..."
                    className="min-h-[80px] resize-none"
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>
                    Detalhes importantes sobre a transação
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-12"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    {transactionId ? "Salvando..." : "Criando..."}
                  </>
                ) : (
                  <>
                    <CreditCardIcon className="h-4 w-4 mr-2" />
                    {transactionId ? "Salvar Alterações" : "Criar Transação"}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="h-12"
                size="lg"
              >
                Cancelar
              </Button>
            </div>
            {isSubmitting && (
              <div
                className="mt-4 p-3 bg-muted rounded-md"
                role="status"
                aria-live="polite"
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div
                    className="animate-pulse h-2 w-2 bg-primary rounded-full"
                    aria-hidden="true"
                  />
                  Processando sua transação...
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
