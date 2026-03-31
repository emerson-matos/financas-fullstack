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
import { useToast } from "@/hooks/use-toast";
import { useCreateGroup } from "@/hooks/use-groups";

const createGroupSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100),
  description: z.string().max(255).optional(),
});

type CreateGroupValues = z.infer<typeof createGroupSchema>;

interface GroupCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GroupCreateDialog({
  open,
  onOpenChange,
}: GroupCreateDialogProps) {
  const { toast } = useToast();
  const { mutate: createGroup, isPending } = useCreateGroup();

  const form = useForm<CreateGroupValues>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: { name: "", description: "" },
  });

  const onSubmit = (values: CreateGroupValues) => {
    createGroup(values, {
      onSuccess: () => {
        toast({ title: "Grupo criado com sucesso!" });
        onOpenChange(false);
        form.reset();
      },
      onError: (error: Error) => {
        toast({
          title: "Erro ao criar grupo",
          description: error.message || "Ocorreu um erro inesperado.",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Grupo</DialogTitle>
          <DialogDescription>
            Crie um grupo para dividir despesas com outras pessoas.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <Field>
            <FieldLabel>Nome</FieldLabel>
            <Input
              {...form.register("name")}
              placeholder="Ex: Viagem, Apartamento..."
            />
            <FieldError errors={[form.formState.errors.name]} />
          </Field>

          <Field>
            <FieldLabel>Descrição (opcional)</FieldLabel>
            <Input
              {...form.register("description")}
              placeholder="Descreva o propósito do grupo"
            />
            <FieldError errors={[form.formState.errors.description]} />
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Grupo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
