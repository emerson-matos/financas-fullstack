"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { splitProposalsService } from "@/lib/services/split-proposals";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { CheckIcon, XIcon, ClockIcon } from "lucide-react";

interface SplitProposalsListProps {
  groupId: string;
  isAdmin: boolean;
}

export function SplitProposalsList({
  groupId,
  isAdmin,
}: SplitProposalsListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { data: proposals, isLoading } = useQuery({
    queryKey: ["split-proposals", groupId],
    queryFn: () => splitProposalsService.getProposals(groupId),
    enabled: !!groupId,
  });

  const approveMutation = useMutation({
    mutationFn: splitProposalsService.approveProposal,
    onSuccess: () => {
      toast({
        title: "Proposta aprovada!",
        description: "A divisão foi aplicada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["split-proposals", groupId] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível aprovar a proposta.",
        variant: "destructive",
      });
    },
    onSettled: () => setProcessingId(null),
  });

  const rejectMutation = useMutation({
    mutationFn: splitProposalsService.rejectProposal,
    onSuccess: () => {
      toast({
        title: "Proposta rejeitada",
        description: "A divisão foi cancelada.",
      });
      queryClient.invalidateQueries({ queryKey: ["split-proposals", groupId] });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível rejeitar a proposta.",
        variant: "destructive",
      });
    },
    onSettled: () => setProcessingId(null),
  });

  const handleApprove = (id: string) => {
    setProcessingId(id);
    approveMutation.mutate(id);
  };

  const handleReject = (id: string) => {
    setProcessingId(id);
    rejectMutation.mutate(id);
  };

  if (isLoading) {
    return <div className="text-center p-4">Carregando propostas...</div>;
  }

  if (!proposals?.content || proposals.content.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          Nenhuma proposta de divisão pendente.
        </CardContent>
      </Card>
    );
  }

  // Extended type for proposal with transaction details
  type ProposalWithTransaction = {
    id: string;
    group_id: string;
    status: "pending" | "approved" | "rejected";
    split_rules: any;
    transaction?: {
      name: string;
      amount: number;
      currency: string;
    };
  };

  return (
    <div className="space-y-4">
      {(proposals.content as unknown as ProposalWithTransaction[]).map(
        (proposal) => (
          <Card key={proposal.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">
                    {proposal.transaction?.name || "Transação sem nome"}
                  </CardTitle>
                  <div className="text-sm text-muted-foreground mt-1">
                    {formatCurrency(
                      proposal.transaction?.amount || 0,
                      proposal.transaction?.currency || "BRL",
                    )}
                    {" • "}
                    Recente
                  </div>
                </div>
                <Badge
                  variant={
                    proposal.status === "approved"
                      ? "default"
                      : proposal.status === "rejected"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {proposal.status === "pending" && (
                    <ClockIcon className="w-3 h-3 mr-1" />
                  )}
                  {proposal.status === "approved" && (
                    <CheckIcon className="w-3 h-3 mr-1" />
                  )}
                  {proposal.status === "rejected" && (
                    <XIcon className="w-3 h-3 mr-1" />
                  )}
                  {proposal.status === "pending"
                    ? "Pendente"
                    : proposal.status === "approved"
                      ? "Aprovado"
                      : "Rejeitado"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Display Split Details if possible */}
              <div className="text-sm mb-4">
                {/* Simplified view of rules */}
                <span className="font-medium">Regras de Divisão: </span>
                <span className="text-muted-foreground">
                  {/* Assuming logic to display rules, for now just JSON string or simple text */}
                  Personalizada
                </span>
              </div>

              {isAdmin && proposal.status === "pending" && (
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleReject(proposal.id)}
                    disabled={processingId === proposal.id}
                  >
                    Rejeitar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(proposal.id)}
                    disabled={processingId === proposal.id}
                  >
                    Aprovar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ),
      )}
    </div>
  );
}
