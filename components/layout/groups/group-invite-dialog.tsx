"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCreateGroupInvite } from "@/hooks/use-groups";

const inviteFormSchema = z.object({
  email: z.string().email("E-mail inválido"),
  role: z.enum(["admin", "member"]),
});

type InviteFormValues = z.infer<typeof inviteFormSchema>;

interface GroupInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId?: string;
}

export function GroupInviteDialog({
  open,
  onOpenChange,
  groupId,
}: GroupInviteDialogProps) {
  const { toast } = useToast();
  const { mutate: inviteMember, isPending: isInviting } =
    useCreateGroupInvite();

  const form = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      email: "",
      role: "member",
    },
  });

  const onSubmit = (values: InviteFormValues) => {
    if (!groupId) return;

    inviteMember(
      {
        groupId,
        email: values.email,
        role: values.role,
      },
      {
        onSuccess: () => {
          toast({ title: "Convite enviado com sucesso!" });
          onOpenChange(false);
          form.reset();
        },
        onError: (error: Error) => {
          toast({
            title: "Erro ao enviar convite",
            description: error.message || "Ocorreu um erro inesperado.",
            variant: "destructive",
          });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convidar Membro</DialogTitle>
          <DialogDescription>
            Envie um convite para que outra pessoa possa acessar este grupo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <Field>
            <FieldLabel>E-mail</FieldLabel>
            <Input
              {...form.register("email")}
              placeholder="email@exemplo.com"
            />
            <FieldError errors={[form.formState.errors.email]} />
          </Field>

          <Field>
            <FieldLabel>Papel</FieldLabel>
            <Select
              onValueChange={(v) =>
                form.setValue("role", v as "admin" | "member")
              }
              value={form.watch("role")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Membro</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
            <FieldError errors={[form.formState.errors.role]} />
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isInviting || !groupId}>
              {isInviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar Convite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
