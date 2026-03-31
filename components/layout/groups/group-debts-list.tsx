"use client";

import { useState } from "react";
import { useGroupDebts, useSettleDebt } from "@/hooks/use-groups";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import type { MemberDebt } from "@/lib/types";

interface GroupDebtsListProps {
  groupId: string;
  isAdmin: boolean;
}

export function GroupDebtsList({ groupId, isAdmin }: GroupDebtsListProps) {
  const { data, isLoading } = useGroupDebts(groupId);
  const { mutate: settleDebt, isPending } = useSettleDebt(groupId);
  const { toast } = useToast();
  const [settlingId, setSettlingId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const allDebts = (data?.content ?? []) as MemberDebt[];
  const debts = showAll ? allDebts : allDebts.filter((d) => d.status === "unpaid");

  function handleSettle(debtId: string) {
    setSettlingId(debtId);
    settleDebt(debtId, {
      onSuccess: () => {
        toast({ title: "Dívida quitada!", description: "Status atualizado com sucesso." });
      },
      onError: () => {
        toast({
          title: "Erro",
          description: "Não foi possível quitar a dívida.",
          variant: "destructive",
        });
      },
      onSettled: () => setSettlingId(null),
    });
  }

  if (isLoading) {
    return <div className="text-center p-4">Carregando dívidas...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAll((v) => !v)}
        >
          {showAll ? "Mostrar só a pagar" : "Mostrar todas"}
        </Button>
      </div>

      {debts.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            {showAll ? "Nenhuma dívida encontrada." : "Nenhuma dívida pendente."}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-0 p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Devedor</TableHead>
                  <TableHead>Transação</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  {isAdmin && <TableHead className="text-right">Ação</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {debts.map((debt) => (
                  <TableRow key={debt.id}>
                    <TableCell className="font-medium">
                      {debt.debtor?.name || debt.debtor?.email || debt.user_id}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {debt.proposal?.transaction?.name ?? "—"}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      {formatCurrency(
                        debt.proposal?.transaction?.amount ?? debt.amount,
                        debt.proposal?.transaction?.currency ?? "BRL",
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {debt.status === "paid" ? (
                        <Badge variant="default">Pago</Badge>
                      ) : (
                        <Badge variant="secondary">A pagar</Badge>
                      )}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        {debt.status === "unpaid" && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isPending && settlingId === debt.id}
                            onClick={() => handleSettle(debt.id)}
                          >
                            Marcar como pago
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
