"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useUser } from "@/hooks/use-user";

const profileSchema = z.object({
  nome: z.string().min(2, "Nome obrigatório"),
  email: z.email(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// Helper to get user initials
function getUserInitials(name?: string): string {
  if (!name) {
    return "U";
  }
  return name
    .trim()
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ProfileForm() {
  const { data: user, isLoading, error } = useUser();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { nome: "", email: "" },
  });

  useEffect(() => {
    if (user) {
      const displayName =
        (user.name && user.name !== user.email ? user.name : "") || "";
      form.setValue("nome", displayName);
      form.setValue("email", user.email || "");
    }
  }, [user, form]);

  if (isLoading) {
    return <div>Carregando perfil...</div>;
  }

  if (error) {
    return <div>Erro ao carregar perfil</div>;
  }

  return (
    <form className="space-y-4">
      {/* Avatar section */}
      <div className="flex flex-col items-center gap-2 pb-2">
        <Avatar className="h-16 w-16">
          {user?.picture && (
            <AvatarImage src={user.picture} alt={user?.name || "Avatar"} />
          )}
          <AvatarFallback>
            {getUserInitials(user?.name ?? undefined)}
          </AvatarFallback>
        </Avatar>
        <span className="font-semibold text-lg">{user?.name}</span>
      </div>

      <FieldGroup>
        {/* Only show email field */}
        <Controller
          control={form.control}
          name="email"
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor="profile-email">E-mail</FieldLabel>
              <Input
                {...field}
                id="profile-email"
                readOnly
                className="bg-muted/50 cursor-not-allowed"
              />
              <FieldDescription>
                Seu e-mail não pode ser alterado
              </FieldDescription>
            </Field>
          )}
        />
      </FieldGroup>
    </form>
  );
}
