import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
interface BudgetCreateProps {
  onCreateClick: () => void;
}
export function BudgetCreate({ onCreateClick }: BudgetCreateProps) {
  return (
    <Button onClick={onCreateClick} className="gap-2">
      <Plus className="h-4 w-4" />
      Criar Orçamento
    </Button>
  );
}
