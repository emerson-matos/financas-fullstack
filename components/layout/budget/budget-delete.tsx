import { Trash2 } from "lucide-react";
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
import { useDeleteBudget } from "@/hooks/use-budgets";
import { useToast } from "@/hooks/use-toast";
interface BudgetDeleteProps {
  budgetId: string;
  onSuccess?: () => void;
}
export function BudgetDelete({ budgetId, onSuccess }: BudgetDeleteProps) {
  const { toast } = useToast();
  const deleteBudgetMutation = useDeleteBudget();
  const handleDelete = () => {
    deleteBudgetMutation.mutate(budgetId, {
      onSuccess: () => {
        toast({
          title: "Budget Deleted",
          description: "Your budget has been deleted successfully.",
        });
        onSuccess?.();
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to delete budget. Please try again.",
          variant: "destructive",
        });
      },
    });
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          className="gap-2"
          disabled={deleteBudgetMutation.isPending}
        >
          <Trash2 className="h-4 w-4" />
          Deletar
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deletar Orçamento</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja deletar este orçamento? Esta ação não pode
            ser desfeita e irá remover todos os dados do orçamento e alocações
            de categoria.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteBudgetMutation.isPending}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteBudgetMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteBudgetMutation.isPending ? "Deletando..." : "Deletar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
