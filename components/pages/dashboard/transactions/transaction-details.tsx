"use client";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Calendar,
  CreditCard,
  DollarSign,
  Edit,
  FileText,
  Tag,
  Trash2Icon,
} from "lucide-react";
import { BackButton } from "@/components/back-button";
import { CategoryBadge } from "@/components/category-badge";
import { Heading } from "@/components/heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useDeleteTransaction, useTransaction } from "@/hooks/use-transactions";
import { formatCurrency } from "@/lib/utils";
interface TransactionDetailsProps {
  transactionId: string;
  editUrl?: string;
}
const accountKindToBadge: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  CHECKING: { label: "Conta Corrente", variant: "default" },
  SAVINGS: { label: "Poupança", variant: "secondary" },
  INVESTMENT: { label: "Investimento", variant: "default" },
  CREDIT_CARD: { label: "Cartão de Crédito", variant: "destructive" },
  CASH: { label: "Dinheiro", variant: "outline" },
};
export function TransactionDetails({
  transactionId,
  editUrl,
}: TransactionDetailsProps) {
  const id = transactionId;
  const router = useRouter();
  const handleEdit = () => {
    router.push(editUrl || `/dashboard/transactions/${id}/edit`);
  };
  const { toast } = useToast();
  const { data: transaction, isLoading, error } = useTransaction(id);
  const { mutate: deleteTransaction, isPending: isDeleting } =
    useDeleteTransaction();
  const handleDelete = () => {
    deleteTransaction(id, {
      onSuccess: () => {
        toast({
          title: "Transação excluída",
          description: "A transação foi excluída com sucesso.",
        });
        router.push("/dashboard/transactions");
      },
      onError: (error: unknown) => {
        const description =
          error instanceof Error
            ? error.message
            : "Tente novamente em alguns instantes.";
        toast({
          title: "Erro ao excluir",
          description,
          variant: "destructive",
        });
      },
    });
  };
  if (isLoading) {
    return <TransactionDetailsSkeleton />;
  }
  if (error || !transaction) {
    return (
      <div className="mx-auto space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="flex items-center gap-4">
          <BackButton />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              {error
                ? "Erro ao carregar transação"
                : "Transação não encontrada"}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  const getAmountColor = (amount: number, kind?: string) => {
    if (kind === "transfer") {
      return "text-muted-foreground";
    }
    return amount < 0 ? "text-destructive" : "text-green-600";
  };
  const getTransactionTypeLabel = (kind: string) => {
    const types = {
      DEBIT: "Débito",
      CREDIT: "Crédito",
      TRANSFER: "Transferência",
      UNKNOWN: "Desconhecido",
    };
    return types[kind as keyof typeof types] || kind;
  };
  const accountKind = transaction.account
    ?.kind as keyof typeof accountKindToBadge;
  return (
    <div className="mx-auto space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div className="grow space-y-4">
          <Heading
            title="Detalhes da Transação"
            description="Visualize todas as informações desta transação"
          >
            <div className="flex flex-col items-right gap-2 md:flex-row">
              <BackButton />
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="size-4" />
                Editar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2Icon className="size-4" /> Excluir
              </Button>
            </div>
          </Heading>
          <Separator />
        </div>
      </div>
      {/* Main transaction details */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Transaction Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Descrição
              </span>
              <span className="font-medium">{transaction.description}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Valor
              </span>
              <span
                className={`text-lg font-bold ${getAmountColor(
                  transaction.amount,
                  transaction.kind,
                )}`}
              >
                {transaction.amount >= 0 &&
                  transaction.kind !== "transfer" &&
                  "+"}
                {formatCurrency(
                  transaction.amount,
                  transaction.account?.currency ?? "BRL",
                )}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Tipo
              </span>
              <span className="font-medium">
                {getTransactionTypeLabel(transaction.kind)}
              </span>
            </div>
          </CardContent>
        </Card>
        {/* Date and Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Data e Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Data da Transação
              </span>
              <span className="font-medium">
                {format(
                  new Date(transaction.transacted_at),
                  "dd 'de' MMMM 'de' yyyy",
                  {
                    locale: ptBR,
                  },
                )}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Conta
              </span>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {transaction.account?.identification || "N/A"}
                </span>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Tipo de Conta
              </span>
              <span className="font-medium capitalize">
                <Badge
                  variant={
                    accountKindToBadge[accountKind]?.variant || "outline"
                  }
                >
                  {accountKindToBadge[accountKind]?.label || "Desconhecido"}
                </Badge>
              </span>
            </div>
          </CardContent>
        </Card>
        {/* Category Information */}
        {transaction.category && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <CategoryBadge
                  id={transaction.category.id}
                  name={transaction.category.name}
                />
                {transaction.category.parent && (
                  <div className="text-sm text-muted-foreground">
                    Subcategoria de: {transaction.category.parent.name}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Metadados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                ID da Transação
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {transaction.id}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Criado em
              </span>
              <span className="text-sm">
                {format(
                  new Date(transaction.created_at),
                  "dd/MM/yyyy 'às' HH:mm",
                  {
                    locale: ptBR,
                  },
                )}
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">
                Atualizado em
              </span>
              <span className="text-sm">
                {format(
                  new Date(transaction.updated_at),
                  "dd/MM/yyyy 'às' HH:mm",
                  {
                    locale: ptBR,
                  },
                )}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
function TransactionDetailsSkeleton() {
  return (
    <div className="mx-auto space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-20" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-9 w-24" />
      </div>
      <Separator />
      {/* Cards skeleton */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
