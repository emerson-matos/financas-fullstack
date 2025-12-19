"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Loader2, Rocket, Wallet } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCompleteOnboarding, useUser } from "@/hooks/use-user";
import { accountKinds, defaultFirstAccount } from "@/lib/constants";
import {
  budgetingOptions,
  currencyOptions,
  notificationLabels,
  type WelcomeFormData,
  welcomeFormSchema,
} from "@/lib/types";

const WelcomePage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const completeOnboardingMutation = useCompleteOnboarding();
  const { data: user, isFetching, isPending, isLoading } = useUser();

  const form = useForm<WelcomeFormData>({
    resolver: zodResolver(welcomeFormSchema),
    defaultValues: {
      preferredCurrency: "BRL",
      budgetingGoals: [],
      notificationPreferences: {
        emailReports: true,
        budgetAlerts: true,
        transactionReminders: false,
      },
      financialGoals: "",
      firstAccount: {
        name: defaultFirstAccount.name,
        kind: defaultFirstAccount.kind,
        initialAmount: defaultFirstAccount.initialAmount,
      },
    },
  });

  const handleSubmit = async (data: WelcomeFormData) => {
    try {
      await completeOnboardingMutation.mutateAsync(data);
      toast({
        title: `Bem-vindo(a)! ${user?.name ?? ""}`,
        description: "Sua conta foi configurada com sucesso.",
      });
      // Explicit redirect after success
      router.push("/dashboard/home");
    } catch (error) {
      console.error("Onboarding error:", error);
      toast({
        title: "Erro na Configuração",
        description:
          "Houve um problema ao configurar sua conta. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user?.onboardingCompleted && !isFetching && !isPending && !isLoading) {
      router.replace("/dashboard/home");
    }
  }, [user?.onboardingCompleted, router, isFetching, isPending, isLoading]);

  if (user?.onboardingCompleted || isFetching || isPending || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
            Bem-vindo(a) ao seu Painel Financeiro!
            <Rocket className="w-8 h-8" />
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Vamos personalizar sua experiência para ajudá-lo(a) a alcançar seus
            objetivos financeiros
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FieldGroup>
              {/* Currency Preference */}
              <Controller
                control={form.control}
                name="preferredCurrency"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="text-base font-semibold">
                      Moeda Preferida
                    </FieldLabel>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-wrap gap-4"
                    >
                      {currencyOptions.map((currency) => (
                        <div
                          key={currency}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem value={currency} id={currency} />
                          <Label htmlFor={currency}>{currency}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Separator />

              {/* Budgeting Goals */}
              <Controller
                control={form.control}
                name="budgetingGoals"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel className="text-base font-semibold">
                      Quais são seus principais objetivos financeiros?
                    </FieldLabel>
                    <FieldDescription>
                      Selecione todos que se aplicam
                    </FieldDescription>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {budgetingOptions.map((option) => (
                        <div
                          key={option.id}
                          className="flex flex-row items-start space-x-3 space-y-0"
                        >
                          <Checkbox
                            id={`goal-${option.id}`}
                            checked={field.value?.includes(option.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, option.id])
                                : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== option.id,
                                    ),
                                  );
                            }}
                          />
                          <Label
                            htmlFor={`goal-${option.id}`}
                            className="text-sm font-normal"
                          >
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Separator />

              {/* Financial Goals */}
              <Controller
                control={form.control}
                name="financialGoals"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel
                      htmlFor="financial-goals"
                      className="text-base font-semibold"
                    >
                      Conte-nos sobre suas aspirações financeiras
                    </FieldLabel>
                    <FieldDescription>Este campo é opcional</FieldDescription>
                    <Textarea
                      {...field}
                      id="financial-goals"
                      placeholder="Ex: Comprar uma casa, quitar financiamento estudantil, criar reserva de emergência..."
                      className="min-h-20"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Separator />

              {/* Notification Preferences */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  Preferências de Notificação
                </Label>
                <div className="space-y-3">
                  <Controller
                    control={form.control}
                    name="notificationPreferences.emailReports"
                    render={({ field }) => (
                      <div className="flex flex-row items-start space-x-3 space-y-0">
                        <Checkbox
                          id="email-reports"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label
                          htmlFor="email-reports"
                          className="text-sm font-normal"
                        >
                          {notificationLabels.emailReports}
                        </Label>
                      </div>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name="notificationPreferences.budgetAlerts"
                    render={({ field }) => (
                      <div className="flex flex-row items-start space-x-3 space-y-0">
                        <Checkbox
                          id="budget-alerts"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label
                          htmlFor="budget-alerts"
                          className="text-sm font-normal"
                        >
                          {notificationLabels.budgetAlerts}
                        </Label>
                      </div>
                    )}
                  />
                  <Controller
                    control={form.control}
                    name="notificationPreferences.transactionReminders"
                    render={({ field }) => (
                      <div className="flex flex-row items-start space-x-3 space-y-0">
                        <Checkbox
                          id="transaction-reminders"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                        <Label
                          htmlFor="transaction-reminders"
                          className="text-sm font-normal"
                        >
                          {notificationLabels.transactionReminders}
                        </Label>
                      </div>
                    )}
                  />
                </div>
              </div>
            </FieldGroup>

            <Separator />

            {/* First Account Configuration */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                <Label className="text-base font-semibold">
                  Sua Primeira Conta
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Vamos criar sua primeira conta financeira. Você pode adicionar
                mais contas depois.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <Controller
                  control={form.control}
                  name="firstAccount.name"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="first-account-name">
                        Nome da Conta
                      </FieldLabel>
                      <Input
                        {...field}
                        id="first-account-name"
                        placeholder="Ex: Carteira, Nubank..."
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
                  name="firstAccount.kind"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="first-account-kind">
                        Tipo de Conta
                      </FieldLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger
                          id="first-account-kind"
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
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              <Controller
                control={form.control}
                name="firstAccount.initialAmount"
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="first-account-amount">
                      Saldo Inicial
                    </FieldLabel>
                    <Input
                      type="number"
                      step="0.01"
                      id="first-account-amount"
                      placeholder="0.00"
                      value={field.value}
                      onChange={(e) => {
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
                      Quanto você tem atualmente nesta conta
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <Separator />

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <Button
                type="submit"
                size="lg"
                disabled={completeOnboardingMutation.isPending}
                className="w-full md:w-auto"
              >
                {completeOnboardingMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Configurando sua conta...
                  </>
                ) : (
                  "Concluir Configuração e Começar"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomePage;
