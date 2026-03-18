"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GroupInviteDialog } from "@/components/layout/groups/group-invite-dialog";
import { useGroups } from "@/hooks/use-groups";
import type { Group } from "@/lib/types";

export function GroupList() {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const router = useRouter();

  const { data: groups, isLoading, error } = useGroups();

  const sortedGroups = useMemo(() => {
    const list = groups?.content ?? groups ?? [];
    if (!Array.isArray(list)) return [] as Array<Group>;
    return [...list].sort((a, b) =>
      (b.updated_at || "").localeCompare(a.updated_at || ""),
    );
  }, [groups]);

  const handleCardClick = (id: string) => {
    router.push(`/dashboard/groups/${id}`);
  };

  const memberCountLabel = (group: Group) => {
    const count = group.members?.length ?? 0;
    const label = count === 1 ? "membro" : "membros";
    return `${count} ${label}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            Novo Grupo
          </Button>
        </div>
        {[1, 2, 3].map((item) => (
          <Card key={item} className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsInviteOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Grupo
        </Button>
      </div>

      {error ? (
        <Card className="p-4 text-center text-sm text-destructive">
          Não foi possível carregar os grupos. Tente novamente.
        </Card>
      ) : sortedGroups.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Nenhum grupo encontrado.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedGroups.map((group) => (
            <Card
              key={group.id}
              className="p-4 transition hover:-translate-y-0.5 hover:shadow-sm"
              onClick={() => handleCardClick(group.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-base font-semibold leading-tight">
                      {group.name}
                    </h3>
                  </div>
                  {group.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {group.description}
                    </p>
                  )}
                </div>
                <Badge variant="secondary">{memberCountLabel(group)}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {isInviteOpen && (
        <GroupInviteDialog
          open={isInviteOpen}
          onOpenChange={setIsInviteOpen}
          groupId={undefined} // New group
        />
      )}
    </div>
  );
}
