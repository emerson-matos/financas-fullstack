"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users } from "lucide-react";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default function AcceptInvitePage({ params }: PageProps) {
  const { token } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [accepted, setAccepted] = useState(false);

  const { mutate: acceptInvite, isPending } = useMutation({
    mutationFn: () =>
      api.post<{ group_id: string }>(`/invites/${token}/accept`, {}),
    onSuccess: (response) => {
      setAccepted(true);
      toast({ title: "Convite aceito! Bem-vindo ao grupo." });
      setTimeout(() => {
        router.push(
          `/dashboard/groups/${(response as { data: { group_id: string } }).data.group_id}`,
        );
      }, 1500);
    },
    onError: (error: Error) => {
      toast({
        title: "Não foi possível aceitar o convite",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Convite para Grupo</CardTitle>
          <CardDescription>
            Você foi convidado para participar de um grupo de divisão de
            despesas.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          {accepted
            ? "Você entrou no grupo! Redirecionando..."
            : "Clique em aceitar para entrar no grupo e começar a dividir despesas."}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push("/dashboard")}
            disabled={isPending || accepted}
          >
            Recusar
          </Button>
          <Button
            className="flex-1"
            onClick={() => acceptInvite()}
            disabled={isPending || accepted}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Aceitar Convite
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
