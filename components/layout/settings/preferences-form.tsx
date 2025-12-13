"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ComputerIcon, MoonIcon, SunIcon } from "lucide-react";
import { useId } from "react";
import { Controller, useForm } from "react-hook-form";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";

const preferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
});

type PreferencesFormValues = z.infer<typeof preferencesSchema>;

export function PreferencesForm() {
  const { toast } = useToast();
  const { setTheme, theme } = useTheme();
  const themeLabelId = useId();
  const themeTriggerId = useId();
  const idiomaId = useId();

  const form = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      theme: theme as "light" | "dark" | "system",
    },
  });

  function onSubmit(data: PreferencesFormValues) {
    setTheme(data.theme);
    toast({ title: "Preferências salvas!" });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup>
        <Controller
          name="theme"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel id={themeLabelId} htmlFor={themeTriggerId}>
                Tema
              </FieldLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <SelectTrigger
                  id={themeTriggerId}
                  aria-labelledby={themeLabelId}
                  className="w-full"
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue placeholder="Selecione o tema..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <SunIcon className="mr-2 h-4 w-4" />
                    Claro
                  </SelectItem>
                  <SelectItem value="dark">
                    <MoonIcon className="mr-2 h-4 w-4" />
                    Escuro
                  </SelectItem>
                  <SelectItem value="system">
                    <ComputerIcon className="mr-2 h-4 w-4" />
                    Sistema
                  </SelectItem>
                </SelectContent>
              </Select>
              <FieldDescription>Escolha o tema do aplicativo.</FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Field>
          <FieldLabel htmlFor={idiomaId}>Idioma</FieldLabel>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Input
                  id={idiomaId}
                  value="pt-BR"
                  readOnly
                  className="cursor-not-allowed bg-muted/50"
                />
              </TooltipTrigger>
              <TooltipContent side="top">
                No momento, apenas português é suportado.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <FieldDescription>
            Idioma do aplicativo (apenas português disponível).
          </FieldDescription>
        </Field>

        <Button type="submit" disabled={form.formState.isSubmitting}>
          Salvar
        </Button>
      </FieldGroup>
    </form>
  );
}
