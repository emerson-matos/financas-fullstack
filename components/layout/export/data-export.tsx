"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, FileDown } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
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
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { downloadFile } from "@/lib/file-download";

const formSchema = z.object({
  exportType: z.enum(["transactions", "accounts", "budgets"], {
    message: "Selecione o que exportar",
  }),
  format: z.enum(["json", "csv"], {
    message: "Selecione um formato",
  }),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function DataExport() {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      exportType: "transactions",
      format: "csv",
    },
  });

  const exportType = form.watch("exportType");
  const showDateRange = exportType === "transactions";

  async function onSubmit(values: FormValues) {
    setIsDownloading(true);
    try {
      let url = `/export?type=${values.exportType}&format=${values.format}`;
      if (values.startDate) {
        url += `&startDate=${values.startDate.toISOString()}`;
      }
      if (values.endDate) {
        url += `&endDate=${values.endDate.toISOString()}`;
      }

      const filename = `${values.exportType}_export_${format(
        new Date(),
        "yyyy-MM-dd",
      )}.${values.format}`;

      if (values.format === "csv") {
        const result = await downloadFile(url, filename);
        if (result.success) {
          handleDownloadSuccess();
        } else {
          handleDownloadError(result.error || "Download failed");
        }
      } else {
        window.open(url, "_blank");
        toast({
          title: "Exportação bem-sucedida",
          description: `Seus dados de ${values.exportType} foram exportados no formato ${values.format.toUpperCase()}.`,
        });
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({
        title: "Exportação falhou",
        description: "Houve um erro ao exportar seus dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  }

  const handleDownloadSuccess = () => {
    const values = form.getValues();
    toast({
      title: "Exportação bem-sucedida",
      description: `Seus dados de ${values.exportType} foram exportados no formato ${values.format.toUpperCase()}.`,
    });
  };

  const handleDownloadError = (error: string) => {
    toast({
      title: "Exportação falhou",
      description:
        error || "Houve um erro ao exportar seus dados. Tente novamente.",
      variant: "destructive",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exportar Dados</CardTitle>
        <CardDescription>
          Exporte seus dados financeiros em vários formatos para backup ou
          análise
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FieldGroup>
            <Controller
              control={form.control}
              name="exportType"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="export-type">O que Exportar</FieldLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger
                      id="export-type"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Selecione o que exportar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transactions">Transações</SelectItem>
                      <SelectItem value="accounts">Contas</SelectItem>
                      <SelectItem value="budgets">Orçamentos</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    Escolha o tipo de dados que deseja exportar
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="format"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="export-format">
                    Formato de Exportação
                  </FieldLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger
                      id="export-format"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Selecione o formato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV (Excel)</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    Escolha o formato para seus dados exportados
                  </FieldDescription>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {showDateRange && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Controller
                  control={form.control}
                  name="startDate"
                  render={({ field, fieldState }) => (
                    <Field
                      className="flex flex-col"
                      data-invalid={fieldState.invalid}
                    >
                      <FieldLabel htmlFor="start-date">
                        Data Inicial (Opcional)
                      </FieldLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="start-date"
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                            aria-invalid={fieldState.invalid}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Selecione uma data</span>
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
                      <FieldDescription>
                        Inclua apenas transações a partir desta data
                      </FieldDescription>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="endDate"
                  render={({ field, fieldState }) => (
                    <Field
                      className="flex flex-col"
                      data-invalid={fieldState.invalid}
                    >
                      <FieldLabel htmlFor="end-date">
                        Data Final (Opcional)
                      </FieldLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="end-date"
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                            aria-invalid={fieldState.invalid}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Selecione uma data</span>
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
                      <FieldDescription>
                        Inclua apenas transações até esta data
                      </FieldDescription>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            )}
          </FieldGroup>

          <Button type="submit" className="w-full" disabled={isDownloading}>
            {isDownloading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Exportando...
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                Exportar Dados
              </>
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        Seus dados serão exportados no formato selecionado. Para arquivos CSV,
        um download iniciará automaticamente.
      </CardFooter>
    </Card>
  );
}
