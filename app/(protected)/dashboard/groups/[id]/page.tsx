"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useGroup } from "@/hooks/use-groups";
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
import { ArrowLeftIcon, SettingsIcon } from "lucide-react";
import { SplitProposalsList } from "@/components/layout/groups/split-proposals-list";
import { GroupMembership } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function GroupDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params);
  // useGroup returns { data: Group | undefined, isLoading: boolean } from react-query
  // BUT the service logic might wrap it. Let's check api.ts again.
  // api.get returns ApiResponse<T> where T has data property?
  // groupsService.getGroup returns response (which is ApiResponse<Group>).
  // So data in useQuery is ApiResponse<Group>.
  // So we access data.data.
  const { data: groupResponse, isLoading } = useGroup(id);
  const group = groupResponse?.data;

  const { user } = useAuth();

  const membership = group?.members?.find(
    (m: GroupMembership) => m.user_id === user?.id,
  );
  const isAdmin = membership?.user_role === "admin";

  if (isLoading) {
    return <div className="p-8">Carregando grupo...</div>;
  }

  if (!group) {
    return (
      <div className="p-8">
        <h2 className="text-xl font-semibold mb-4">Grupo não encontrado</h2>
        <Button onClick={() => router.back()}>Voltar</Button>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeftIcon className="h-5 w-5" />
        </Button>
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
          <TabsTrigger value="members">Membros</TabsTrigger>
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
          <Card>
            <CardHeader>
              <CardTitle>Membros</CardTitle>
              <CardDescription>
                Pessoas participantes deste grupo ({group.members?.length || 0})
              </CardDescription>
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
                        {member.user?.name || member.user?.email}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {member.user_role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center">
                {/* TODO: Listagem de transações será implementada em breve. */}
                Listagem de transações será implementada em breve.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
