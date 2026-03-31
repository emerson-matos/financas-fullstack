"use client";

import { use, useState } from "react";
import { useGroup, useGroupInvites, useDeleteGroupInvite } from "@/hooks/use-groups";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SettingsIcon, UserPlus, Trash2, Copy } from "lucide-react";
import { SplitProposalsList } from "@/components/layout/groups/split-proposals-list";
import { GroupInviteDialog } from "@/components/layout/groups/group-invite-dialog";
import { GroupMembership, GroupInvite } from "@/lib/types";
import { BackButton } from "@/components/back-button";
import { useToast } from "@/hooks/use-toast";
import { APP_URL } from "@/lib/constants";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function GroupDetailsPage({ params }: PageProps) {
  const { id } = use(params);
  const { data: groupResponse, isLoading } = useGroup(id);
  const group = groupResponse?.data;

  const { user } = useAuth();
  const { toast } = useToast();
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const membership = group?.members?.find(
    (m: GroupMembership) => m.user_id === user?.id,
  );
  const isAdmin = membership?.user_role === "admin";

  const { data: invitesResponse } = useGroupInvites(id);
  const invites = (invitesResponse?.content ?? []) as GroupInvite[];
  const pendingInvites = invites.filter((inv) => inv.status === "pending");

  const { mutate: deleteInvite } = useDeleteGroupInvite(id);

  const copyInviteLink = (token: string) => {
    const link = `${APP_URL}/invite/${token}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Link copiado!" });
  };

  if (isLoading) {
    return <div className="p-8">Carregando grupo...</div>;
  }

  if (!group) {
    return (
      <div className="p-8">
        <h2 className="text-xl font-semibold mb-4">Grupo não encontrado</h2>
        <BackButton />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center gap-4">
        <BackButton />
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight">{group.name}</h2>
          {group.description && (
            <p className="text-muted-foreground">{group.description}</p>
          )}
        </div>
        {isAdmin && (
          <Button variant="outline" size="icon">
            <SettingsIcon className="h-4 w-4" />
          </Button>
        )}
      </div>

      <Tabs defaultValue="proposals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="proposals">Propostas de Divisão</TabsTrigger>
          <TabsTrigger value="members">
            Membros
            {pendingInvites.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {pendingInvites.length} pendente{pendingInvites.length > 1 ? "s" : ""}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
        </TabsList>

        <TabsContent value="proposals" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Propostas Pendentes</h3>
              <p className="text-sm text-muted-foreground">
                Gerencie as divisões de despesas sugeridas para o grupo.
              </p>
            </div>
          </div>

          <SplitProposalsList groupId={id} isAdmin={isAdmin} />
        </TabsContent>

        <TabsContent value="members">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Membros</CardTitle>
                    <CardDescription>
                      Pessoas participantes deste grupo ({group.members?.length || 0})
                    </CardDescription>
                  </div>
                  {isAdmin && (
                    <Button size="sm" onClick={() => setIsInviteOpen(true)}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Convidar
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {group.members?.map((member: GroupMembership) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium">
                          {member.profile?.name || member.profile?.email || member.user_id}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {member.user_role === "admin" ? "Administrador" : "Membro"}
                        </p>
                      </div>
                      <Badge variant={member.user_role === "admin" ? "default" : "secondary"}>
                        {member.user_role === "admin" ? "Admin" : "Membro"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {isAdmin && pendingInvites.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Convites Pendentes</CardTitle>
                  <CardDescription>
                    Convites enviados aguardando aceitação
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {pendingInvites.map((invite: GroupInvite) => (
                      <div
                        key={invite.id}
                        className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                      >
                        <div>
                          <p className="text-sm font-medium">{invite.email}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {invite.role === "admin" ? "Administrador" : "Membro"} •{" "}
                            Expira em {new Date(invite.expires_at).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => copyInviteLink(invite.token)}
                            title="Copiar link de convite"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => deleteInvite(invite.id)}
                            title="Cancelar convite"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">
                Listagem de transações será implementada em breve.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <GroupInviteDialog
        open={isInviteOpen}
        onOpenChange={setIsInviteOpen}
        groupId={id}
      />
    </div>
  );
}
