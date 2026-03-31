"use client";

import { useGroupTransactions } from "@/hooks/use-groups";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { ClockIcon, CheckIcon, XIcon } from "lucide-react";

interface GroupTransactionsListProps {
  groupId: string;
}

export function GroupTransactionsList({ groupId }: GroupTransactionsListProps) {
  const { data, isLoading } = useGroupTransactions(groupId);

  if (isLoading) {
    return <div className="text-center p-4">Carregando transações...</div>;
  }

  const transactions = data?.content ?? [];

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          Nenhuma transação encontrada para este grupo.
        </CardContent>
      </Card>
    );
  }

  function ProposalBadge({
    proposal,
  }: {
    proposal: { id: string; status: "pending" | "approved" | "rejected" } | null | undefined;
  }) {
    if (!proposal) {
      return <span className="text-muted-foreground">—</span>;
    }
    if (proposal.status === "approved") {
      return (
        <Badge variant="default">
          <CheckIcon className="w-3 h-3 mr-1" />
          Aprovada
        </Badge>
      );
    }
    if (proposal.status === "rejected") {
      return (
        <Badge variant="destructive">
          <XIcon className="w-3 h-3 mr-1" />
          Rejeitada
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        <ClockIcon className="w-3 h-3 mr-1" />
        Pendente
      </Badge>
    );
  }

  return (
    <Card>
      <CardContent className="pt-0 p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-center">Proposta</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {new Date(tx.transacted_at).toLocaleDateString("pt-BR")}
                </TableCell>
                <TableCell className="font-medium">{tx.name}</TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  {formatCurrency(tx.amount, tx.currency)}
                </TableCell>
                <TableCell className="text-center">
                  <ProposalBadge proposal={tx.proposal} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
