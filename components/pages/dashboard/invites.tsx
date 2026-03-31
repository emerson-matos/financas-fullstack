"use client";

import { useRouter } from "next/navigation";
import { MailCheck, MailOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyInvites, useAcceptInvite } from "@/hooks/use-groups";
import type { PendingInvite } from "@/lib/types";

function InvitesSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800/40 dark:bg-amber-950/10">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <MailCheck className="h-12 w-12 text-muted-foreground/40 mb-4" />
      <p className="text-base font-medium text-foreground">Nenhum convite pendente</p>
      <p className="mt-1 text-sm text-muted-foreground max-w-xs">
        Quando alguém te convidar para um grupo, o convite aparecerá aqui.
      </p>
    </div>
  );
}

function roleLabel(role: "admin" | "member") {
  return role === "admin" ? "Administrador" : "Membro";
}

function roleBadgeClass(role: "admin" | "member") {
  return role === "admin"
    ? "border-amber-300 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
    : "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400";
}

function formatExpiry(expiresAt: string) {
  const diff = Math.ceil(
    (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  if (diff <= 0) return "Expirado";
  if (diff === 1) return "Expira amanhã";
  return `Expira em ${diff} dias`;
}

function InviteCard({ invite }: { invite: PendingInvite }) {
  const router = useRouter();
  const { mutate: acceptInvite, isPending } = useAcceptInvite();

  const handleAccept = () => {
    acceptInvite(invite.token, {
      onSuccess: () => {
        router.push(`/dashboard/groups/${invite.group.id}`);
      },
    });
  };

  return (
    <Card className="border border-amber-200 bg-amber-50/50 p-5 dark:border-amber-800/40 dark:bg-amber-950/20">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <p className="text-base font-semibold leading-tight truncate">{invite.group.name}</p>
          {invite.group.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {invite.group.description}
            </p>
          )}
          <p className="text-xs text-muted-foreground pt-0.5">
            {formatExpiry(invite.expires_at)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 pt-0.5">
          <Badge variant="outline" className={roleBadgeClass(invite.role)}>
            {roleLabel(invite.role)}
          </Badge>
          <Button size="sm" onClick={handleAccept} disabled={isPending}>
            Aceitar
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function Invites() {
  const { data: invites, isLoading } = useMyInvites();

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
          <MailOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Convites Pendentes</h2>
          <p className="text-muted-foreground">Grupos para os quais você foi convidado.</p>
        </div>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <InvitesSkeleton />
        ) : !invites || invites.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="animate-in fade-in duration-300 space-y-3">
            {invites.map((invite) => (
              <InviteCard key={invite.id} invite={invite} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
