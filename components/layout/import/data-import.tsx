"use client";

import { AlertCircle, FileText, Upload } from "lucide-react";
import { useState } from "react";
import { type FileRejection, useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAccounts } from "@/hooks/use-accounts";
import { useCategories } from "@/hooks/use-categories";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  useBulkCreateTransactions,
  useParseFileImport,
} from "@/hooks/use-transactions";
import type {
  CreateTransactionRequest,
  ImportResult,
  ParsedTransaction,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { validateFile } from "@/lib/file-validation";

type ImportStep = "upload" | "review";

interface FileInfo {
  name: string;
  content: string;
  bank?: string;
}

// Bank detection
const detectBank = (content: string): string | undefined => {
  if (content.includes("<BANKID>0260") || content.includes("<FID>260")) {
    return "Nubank";
  }
  if (content.includes("<BANKID>0341") || content.includes("<FID>0341")) {
    return "Itaú";
  }
  if (content.includes("<BANKID>0033") || content.includes("<FID>033")) {
    return "Santander";
  }
  if (content.includes("<BANKID>0237") || content.includes("<FID>237")) {
    return "Bradesco";
  }
  return undefined;
};

// Statistics Card Component
function StatCard({
  value,
  label,
  variant = "default",
}: {
  value: number;
  label: string;
  variant?: "default" | "success" | "error";
}) {
  const colors = {
    default: "bg-blue-50 text-blue-600",
    success: "bg-green-50 text-green-600",
    error: "bg-red-50 text-red-600",
  };

  return (
    <div className={cn("text-center p-4 rounded-lg", colors[variant])}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

// File List Component
function FileList({ files }: { files: FileInfo[] }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="h-4 w-4" />
        <span className="font-semibold">
          {files.length} arquivo{files.length !== 1 ? "s" : ""} selecionado
          {files.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {files.map((file, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 p-2 bg-secondary rounded-md"
          >
            <Badge variant="outline">{file.name}</Badge>
            {file.bank && <Badge variant="secondary">{file.bank}</Badge>}
          </div>
        ))}
      </div>
    </div>
  );
}

// Review Table Component
function ReviewTable({
  transactions,
  categories,
}: {
  transactions: CreateTransactionRequest[];
  categories?: Category[];
}) {
  const getCategoryName = (id?: string) => {
    if (!id) return "Desconhecido";
    const category = categories?.find((c) => c.id === id);
    return category?.name || "Desconhecido";
  };
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(amount);
  };

  const formatDate = (date: string) => {
    if (!date) return "Data Inválida";
    const timePart = date.split("T")[0];
    const d = new Date(timePart);
    return d.toLocaleDateString("pt-BR");
  };

  const formatTime = (date: string) => {
    if (!date) return "--:--";

    if (date.includes("T")) {
      const timePart = date.split("T")[1].substring(0, 5);
      return timePart;
    }
    return "--:--";
  };

  const getKindBadge = (kind: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      CREDIT: "default",
      DEBIT: "destructive",
      TRANSFER: "secondary",
    };
    return <Badge variant={variants[kind] || "secondary"}>{kind}</Badge>;
  };

  return (
    <div className="overflow-auto rounded-md border max-h-[400px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Hora</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction, index) => (
            <TableRow key={index}>
              <TableCell>{getKindBadge(transaction.kind)}</TableCell>
              <TableCell className="max-w-md truncate">
                {transaction.description}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="font-normal">
                  {getCategoryName(transaction.categoryId)}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatCurrency(transaction.amount)}
              </TableCell>
              <TableCell>{formatDate(transaction.transactedAt)}</TableCell>
              <TableCell className="font-mono text-xs">
                {formatTime(transaction.transactedAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Main Component
export function DataImport() {
  const [currentStep, setCurrentStep] = useState<ImportStep>("upload");
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    "c0000000-0000-0000-0000-000000000002", // Default to "Desconhecido"
  );
  const [transactions, setTransactions] = useState<CreateTransactionRequest[]>(
    [],
  );
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: accountsData } = useAccounts({ sort: ["identification,asc"] });
  const { data: categoriesData } = useCategories();
  const parseFileMutation = useParseFileImport();
  const importMutation = useBulkCreateTransactions();
  const isMobile = useIsMobile();

  const reset = () => {
    setCurrentStep("upload");
    setFiles([]);
    setTransactions([]);
    setSelectedAccountId("");
    setImportResult(null);
    setIsProcessing(false);
  };

  const processFiles = async (filesToProcess: File[]) => {
    if (!selectedAccountId) {
      toast.error("Por favor, selecione uma conta antes de fazer upload.");
      return;
    }

    setIsProcessing(true);

    try {
      // Parse all files
      const fileInfos: FileInfo[] = [];
      const allTransactionsToCreate: CreateTransactionRequest[] = [];
      const allParsedTransactions: ParsedTransaction[] = []; // New array to collect all ParsedTransactions
      let totalSuccess = 0;
      let totalFailed = 0;
      const allErrors: string[] = [];

      for (const file of filesToProcess) {
        const content = await file.text();
        const bank = detectBank(content);

        fileInfos.push({
          name: file.name,
          content,
          bank,
        });

        try {
          const result = await parseFileMutation.mutateAsync({
            fileContent: content,
            fileName: file.name,
            fileFormat: "ofx",
            accountId: selectedAccountId,
          });

          // Collect all ParsedTransactions
          allParsedTransactions.push(...result.transactions);

          const mappedTransactionsForCreation: CreateTransactionRequest[] =
            result.transactions.map((t) => ({
              accountId: selectedAccountId,
              description: t.description,
              amount: t.amount,
              transactedAt: t.transacted_at,
              kind: t.kind,
              categoryId: selectedCategoryId,
              currency: "BRL", // Default currency for imported transactions
            }));

          allTransactionsToCreate.push(...mappedTransactionsForCreation);
          totalSuccess += result.statistics.successfulRecords;
          totalFailed += result.statistics.failedRecords;
          allErrors.push(...result.errors);
        } catch (error) {
          console.error(`Failed to parse ${file.name}:`, error);
          toast.error(`Falha ao processar ${file.name}`);
          totalFailed += 1;
        }
      }

      setFiles(fileInfos);
      setTransactions(allTransactionsToCreate);
      setImportResult({
        transactions: allParsedTransactions, // Use allParsedTransactions for ImportResult
        statistics: {
          totalRecords: totalSuccess + totalFailed,
          successfulRecords: totalSuccess,
          failedRecords: totalFailed,
        },
        errors: allErrors,
      });

      if (allTransactionsToCreate.length > 0) {
        setCurrentStep("review");
        toast.success(
          `${allTransactionsToCreate.length} transações prontas para revisão`,
        );
      } else {
        toast.error("Nenhuma transação encontrada nos arquivos");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao processar arquivos");
    } finally {
      setIsProcessing(false);
    }
  };

  const onDrop = async (
    acceptedFiles: File[],
    rejectedFiles: FileRejection[],
  ) => {
    if (rejectedFiles.length > 0) {
      toast.error("Arquivo rejeitado. Por favor, selecione arquivos OFX.");
      return;
    }

    if (acceptedFiles.length === 0) {
      return;
    }

    const validFiles = acceptedFiles.filter((file) => {
      const validation = validateFile(file, file.name);
      if (!validation.isValid) {
        toast.error(validation.error || "Tipo de arquivo não suportado");
        return false;
      }

      if (!file.name.toLowerCase().endsWith(".ofx")) {
        toast.error(`${file.name}: Apenas arquivos OFX são suportados`);
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) {
      return;
    }

    await processFiles(validFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: isMobile
      ? undefined
      : {
          "application/x-ofx": [".ofx"],
          "text/plain": [".ofx"],
          "application/octet-stream": [".ofx"],
        },
    maxFiles: 10,
    multiple: true,
    disabled: !selectedAccountId || isProcessing,
  });

  const handleConfirmImport = () => {
    importMutation.mutate(transactions, {
      onSuccess: () => {
        toast.success("Transações importadas com sucesso!");
        reset();
      },
      onError: (error) => {
        toast.error("Falha ao importar transações");
        console.error(error);
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Importar Transações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Account Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Conta de Destino</label>
          <Select
            value={selectedAccountId}
            onValueChange={setSelectedAccountId}
            disabled={currentStep === "review"}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma conta" />
            </SelectTrigger>
            <SelectContent>
              {accountsData?.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.identification}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Categoria Padrão</label>
          <Select
            value={selectedCategoryId}
            onValueChange={setSelectedCategoryId}
            disabled={currentStep === "review"}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categoriesData?.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Upload Step */}
        {currentStep === "upload" && (
          <>
            <div
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors space-y-4",
                !selectedAccountId
                  ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-50"
                  : isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50",
              )}
            >
              <input {...getInputProps()} />
              <div className="flex justify-center">
                <Upload
                  className={cn(
                    "h-16 w-16",
                    selectedAccountId ? "text-primary" : "text-gray-400",
                  )}
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">
                  {!selectedAccountId
                    ? "Selecione uma conta primeiro"
                    : isDragActive
                      ? "Solte os arquivos aqui"
                      : isMobile
                        ? "Toque para selecionar arquivos OFX"
                        : "Arraste arquivos OFX ou clique para selecionar"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Suporte para múltiplos arquivos • Formato: .ofx
                </p>
                <p className="text-xs text-muted-foreground">
                  Bancos suportados: Nubank, Itaú, Santander, Bradesco
                </p>
              </div>
              {selectedAccountId && !isProcessing && (
                <Button size="lg" type="button">
                  <Upload className="mr-2 h-4 w-4" />
                  Selecionar Arquivos
                </Button>
              )}
              {isProcessing && (
                <div className="flex items-center justify-center gap-2 text-primary">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                  <span>Processando...</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Review Step */}
        {currentStep === "review" && importResult && (
          <div className="space-y-6">
            <FileList files={files} />

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4">
              <StatCard
                value={importResult.statistics.totalRecords}
                label="Total"
                variant="default"
              />
              <StatCard
                value={importResult.statistics.successfulRecords}
                label="Sucesso"
                variant="success"
              />
              <StatCard
                value={importResult.statistics.failedRecords}
                label="Erros"
                variant="error"
              />
            </div>

            {/* Errors */}
            {importResult.errors.length > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-2">
                    {importResult.errors.length} erro(s) encontrado(s):
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {importResult.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Transactions Table */}
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Transações a Importar ({transactions.length})
              </h3>
              <ReviewTable
                transactions={transactions}
                categories={categoriesData}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={reset}>
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmImport}
                disabled={importMutation.isPending}
              >
                {importMutation.isPending
                  ? "Importando..."
                  : `Importar ${transactions.length} Transações`}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
