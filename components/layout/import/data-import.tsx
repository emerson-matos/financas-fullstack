"use client";
/*
 * NOTE: This file intentionally uses array index as key in preview/review tables.
 * The data does not have a unique identifier, and the order is static for these cases.
 * The biome lint error (noArrayIndexKey) is acknowledged and intentionally ignored for this file.
 * If unique keys become available in the future, please update the key prop accordingly.
 */
import { FileText, Inbox, Upload } from "lucide-react";
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
import { useIsMobile } from "@/hooks/use-mobile";
import {
  useBulkCreateTransactions,
  useParseFileImport,
} from "@/hooks/use-transactions";
import type {
  CreateTransactionRequest,
  ImportRequest,
  ImportResult,
} from "@/lib/types";
import { cn } from "@/lib/utils";
import { validateFile } from "@/lib/file-validation";
type ImportStep = "upload" | "mapping" | "review";
interface FileInfo {
  name: string;
  content: string;
  format: "ofx";
  detectedBank?: string;
}
const detectBank = (content: string): string | undefined => {
  if (content.includes("<BANKID>0260") || content.includes("<FID>260")) {
    return "Nubank";
  }
  if (content.includes("<BANKID>0341")) {
    return "Itaú";
  }
  return "Desconhecido";
};
async function parseOfxFiles(
  ofxFiles: Array<FileInfo>,
  selectedAccountId: string,
  parseFn: (request: ImportRequest) => Promise<ImportResult>,
): Promise<{
  transactions: Array<CreateTransactionRequest>;
  aggregated: ImportResult | null;
  failedCount: number;
}> {
  if (ofxFiles.length === 0) {
    return { transactions: [], aggregated: null, failedCount: 0 };
  }
  const settled = await Promise.allSettled(
    ofxFiles.map((f) =>
      parseFn({
        fileContent: f.content,
        fileName: f.name,
        fileFormat: f.format,
        accountId: selectedAccountId,
      }),
    ),
  );
  const successful = settled.filter(
    (r): r is PromiseFulfilledResult<ImportResult> => r.status === "fulfilled",
  );
  const failedCount = settled.length - successful.length;
  let aggregated: ImportResult | null = null;
  if (successful.length > 0) {
    const initial: ImportResult = {
      transactions: [],
      statistics: {
        totalRecords: 0,
        successfulRecords: 0,
        failedRecords: 0,
      },
      errors: [],
    };
    aggregated = successful.reduce((acc, cur) => {
      const res = cur.value;
      acc.transactions.push(...res.transactions);
      acc.statistics.totalRecords += res.statistics.totalRecords;
      acc.statistics.successfulRecords += res.statistics.successfulRecords;
      acc.statistics.failedRecords += res.statistics.failedRecords;
      acc.errors.push(...res.errors);
      return acc;
    }, initial);
  }
  const transactions: Array<CreateTransactionRequest> = (
    aggregated?.transactions || []
  ).map((transaction) => {
    let amountValue = (
      transaction as unknown as {
        amount: number | { parsedValue?: number };
      }
    ).amount as number | { parsedValue?: number };
    if (typeof amountValue === "object" && amountValue !== null) {
      const amountObj = amountValue as { parsedValue?: number };
      amountValue = amountObj.parsedValue || (amountValue as unknown as number);
    }
    return {
      accountId: selectedAccountId,
      name: transaction.description || "Imported Transaction",
      description: transaction.description,
      currency: undefined,
      kind: transaction.kind,
      transactedDate: transaction.transacted_date,
      amount: amountValue as number,
    };
  });
  return { transactions, aggregated, failedCount };
}
function computeAggregatedResult(
  base: ImportResult | null,
  csvCount: number,
): ImportResult | null {
  if (!base && csvCount === 0) {
    return null;
  }
  const safeBase: ImportResult =
    base ||
    ({
      transactions: [],
      statistics: {
        totalRecords: 0,
        successfulRecords: 0,
        failedRecords: 0,
      },
      errors: [],
    } as ImportResult);
  return {
    transactions: safeBase.transactions,
    statistics: {
      totalRecords: safeBase.statistics.totalRecords + csvCount,
      successfulRecords: safeBase.statistics.successfulRecords + csvCount,
      failedRecords: safeBase.statistics.failedRecords,
    },
    errors: safeBase.errors,
  };
}
export function DataImport() {
  const [currentStep, setCurrentStep] = useState<ImportStep>("upload");
  const [files, setFiles] = useState<Array<FileInfo>>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null,
  );
  const [reviewData, setReviewData] = useState<Array<CreateTransactionRequest>>(
    [],
  );
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  // Use hooks instead of services directly
  const { data: accountsData } = useAccounts({ sort: ["identification,asc"] });
  const parseFileMutation = useParseFileImport();
  const importMutation = useBulkCreateTransactions();
  const isMobile = useIsMobile();
  const reset = () => {
    setCurrentStep("upload");
    setFiles([]);
    setReviewData([]);
    setSelectedAccountId(null);
    setImportResult(null);
    setIsProcessing(false);
  };
  const handleParseMany = async (
    filesToParse: Array<File>,
  ): Promise<{
    infos: Array<FileInfo>;
  }> => {
    const results = await Promise.all(
      filesToParse.map(async (file) => {
        const content = await file.text();
        const detectedBank = detectBank(content);
        const info: FileInfo = {
          format: "ofx",
          name: file.name,
          content,
          detectedBank,
        };
        return { info } as const;
      }),
    );
    const infos: Array<FileInfo> = results.map((r) => r.info);
    return { infos };
  };
  const onDrop = async (
    acceptedFiles: Array<File>,
    rejectedFiles: Array<FileRejection>,
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
      // Only allow OFX
      const nameLower = file.name.toLowerCase();
      if (!nameLower.endsWith(".ofx")) {
        toast.error("Apenas arquivos OFX são suportados.");
        return false;
      }
      return true;
    });
    if (validFiles.length === 0) {
      return;
    }
    try {
      const { infos } = await handleParseMany(validFiles);
      setFiles(infos);
      setCurrentStep("mapping");
    } catch (error) {
      console.error(error);
      toast.error("Falha ao processar arquivos selecionados");
    }
  };
  const dropzoneConfig = {
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
    noClick: false,
    noKeyboard: false,
  };
  const { getRootProps, getInputProps, isDragActive } =
    useDropzone(dropzoneConfig);
  const handleReview = () => {
    if (!selectedAccountId) {
      toast.error("Por favor, selecione uma conta para a importação.");
      return;
    }
    const ofxFiles = files.filter((f) => f.format === "ofx");
    setIsProcessing(true);
    (async () => {
      try {
        const combined: Array<CreateTransactionRequest> = [];
        const {
          transactions: ofxTxs,
          aggregated,
          failedCount,
        } = await parseOfxFiles(ofxFiles, selectedAccountId, (request) =>
          parseFileMutation.mutateAsync(request),
        );
        combined.push(...ofxTxs);
        if (failedCount > 0) {
          toast.error("Falha ao processar um ou mais arquivos OFX");
        }
        const aggregatedAll = computeAggregatedResult(aggregated, 0);
        if (aggregatedAll) {
          setImportResult(aggregatedAll);
        }
        if (combined.length > 0) {
          setReviewData(combined);
          setCurrentStep("review");
        } else {
          toast.error("Nenhuma transação encontrada nos arquivos selecionados");
        }
      } catch (error) {
        console.error(error);
        toast.error("Falha ao processar arquivos.");
      } finally {
        setIsProcessing(false);
      }
    })();
  };
  const handleConfirmImport = () => {
    importMutation.mutate(reviewData, {
      onSuccess: () => {
        toast.success("Transações importadas com sucesso!");
        reset();
      },
      onError: (error) => {
        toast.error("Falha ao importar transações.");
        console.error(error);
      },
    });
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Importar Transações</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="grid-cols-1">
            <span className="font-semibold">Conta</span>
            <Select onValueChange={setSelectedAccountId}>
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
          <div className=" text-gray-500 text-sm">
            <p>Formatos suportados:</p>
            <ul>
              <li>Nubank OFX</li>
              <li>Itaú OFX</li>
            </ul>
          </div>
          {currentStep === "mapping" && (
            <Button
              {...getRootProps()}
              className="border-2 border-dashed border-gray-300 rounded-lg items-end text-center cursor-pointer hover:border-gray-400 transition-colors"
            >
              <input {...getInputProps()} />
              <div className="flex items-center justify-center gap-4">
                <Inbox className="size-4 text-gray-400" />
                <div className="text-center">
                  <p>&quot;Toque para selecionar arquivos OFX&quot;</p>
                </div>
              </div>
            </Button>
          )}
        </div>
        {currentStep === "upload" && (
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-primary/50 transition-colors space-y-4",
              isDragActive && "bg-accent/10",
            )}
          >
            <input {...getInputProps()} />
            <div className="flex justify-center">
              <Upload className="h-16 w-16 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">
                {isDragActive
                  ? "Solte os arquivos aqui"
                  : isMobile
                    ? "Toque para selecionar arquivos OFX"
                    : "Arraste arquivos OFX ou clique para selecionar"}
              </h3>
              <p className="text-muted-foreground">
                Suporte para múltiplos arquivos • Formato aceito: .ofx
              </p>
            </div>
            <Button size="lg" className="mt-4">
              <Upload className="mr-2 h-4 w-4" />
              Selecionar Arquivos
            </Button>
          </div>
        )}
        {currentStep === "mapping" && (
          <>
            <div>
              {files.length > 0 && (
                <div>
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4" />
                      <span className="font-semibold">
                        Arquivos selecionados
                      </span>
                    </div>
                    <div className="grid grid-cols-5 flex-wrap gap-2">
                      {files.map((f, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Badge variant="secondary">{f.name}</Badge>
                          <Badge variant="outline">
                            {f.format.toUpperCase()}
                          </Badge>
                          {f.detectedBank && (
                            <Badge variant="outline">{f.detectedBank}</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <Button onClick={handleReview} disabled={isProcessing}>
                {isProcessing ? "Processando..." : "Revisar Transações"}
              </Button>
            </div>
          </>
        )}
        {currentStep === "review" && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Revisar Importação</h3>
            {importResult && (
              <div className="mb-6">
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {importResult.statistics.totalRecords}
                    </div>
                    <div className="text-sm text-gray-600">Total</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {importResult.statistics.successfulRecords}
                    </div>
                    <div className="text-sm text-gray-600">Sucessos</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {importResult.statistics.failedRecords}
                    </div>
                    <div className="text-sm text-gray-600">Erros</div>
                  </div>
                </div>
                {importResult.errors.length > 0 && (
                  <Alert className="mb-4">
                    <AlertDescription>
                      <div className="font-semibold mb-2">
                        Erros encontrados:
                      </div>
                      <ul className="list-disc list-inside space-y-1">
                        {importResult.errors.map((error, index) => (
                          <li key={index} className="text-sm">
                            {error}
                          </li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
            <div className="overflow-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviewData.map((transaction, index) => (
                    // Using index as key is not ideal, but no unique id is available in review data
                    <TableRow key={index}>
                      <TableCell>{transaction.kind}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{transaction.amount.toFixed(2)}</TableCell>
                      <TableCell>{transaction.transactedDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-end mt-6 gap-4">
              <Button
                variant="outline"
                onClick={() => setCurrentStep("mapping")}
              >
                Voltar
              </Button>
              <Button
                onClick={handleConfirmImport}
                disabled={importMutation.isPending}
              >
                {importMutation.isPending
                  ? "Importando..."
                  : "Confirmar Importação"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
