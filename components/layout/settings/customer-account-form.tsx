"use client";

import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { userService } from "@/lib/services/user";

export function CustomerAccountForm() {
  const [result, setResult] = useState<null | "success" | "error">(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  async function handleEraseUser() {
    setIsDeleting(true);
    try {
      const data = await userService.deleteUser();
      if (data.success) {
        setResult("success");
        toast({
          title: "Usuário apagado com sucesso",
          description: "Sua conta e todos os dados foram removidos.",
        });
      } else {
        setResult("error");
        toast({
          title: "Erro ao apagar usuário",
          description: "Não foi possível apagar sua conta.",
          variant: "destructive",
        });
      }
    } catch {
      setResult("error");
      toast({
        title: "Erro ao apagar usuário",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }
  function handleResultDialogClose() {
    if (result === "success") {
      router.push("/");
    } else {
      setResult(null);
    }
  }
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Esta ação irá apagar permanentemente seu usuário e todos os dados
        associados ao aplicativo.
      </p>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button type="button" variant="destructive" disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Apagando...
              </>
            ) : (
              "Apagar usuário do app"
            )}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apagar usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja apagar seu usuário e todos os dados? Esta
              ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleEraseUser}
              disabled={isDeleting}
              autoFocus
            >
              {isDeleting ? "Apagando..." : "Sim"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Result Dialog */}
      <AlertDialog
        open={result !== null}
        onOpenChange={(open) => {
          if (!open) {
            handleResultDialogClose();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {result === "success"
                ? "Usuário apagado com sucesso!"
                : "Erro ao apagar usuário"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {result === "success"
                ? "Sua conta e todos os dados foram removidos. Você será redirecionado."
                : "Ocorreu um erro ao tentar apagar seu usuário. Tente novamente."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction autoFocus onClick={handleResultDialogClose}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
