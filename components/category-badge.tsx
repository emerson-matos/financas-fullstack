import { Badge } from "@/components/ui/badge";
export const normalizeCategory = (category: string) =>
  category
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_");
const categoryToBgClass: Record<string, string> = {
  supermercado: "bg-category-supermercado",
  aluguel: "bg-category-aluguel",
  contas: "bg-category-contas",
  transporte: "bg-category-transporte",
  entretenimento: "bg-category-entretenimento",
  restaurantes: "bg-category-restaurantes",
  salario: "bg-category-salario",
  rendimentos_de_investimentos: "bg-category-rendimentos-de-investimentos",
  parcelamento_de_emprestimo: "bg-category-parcelamento-de-emprestimo",
  reembolso: "bg-category-reembolso",
  rendimentos_de_juros: "bg-category-rendimentos-de-juros",
  presente: "bg-category-presente",
  despesas_medicas: "bg-category-despesas-medicas",
  compras: "bg-category-compras",
  seguro: "bg-category-seguro",
  desconhecido: "bg-category-desconhecido",
  inicial: "bg-category-inicial",
};
// Simple interface for CategoryBadge props - only what's actually needed
interface CategoryBadgeProps {
  id?: string;
  name?: string;
}
// Category badge with appropriate color
export function CategoryBadge({ name = "desconhecido" }: CategoryBadgeProps) {
  const normalizedCategory = normalizeCategory(name);
  return (
    <Badge
      className={`${
        categoryToBgClass[normalizedCategory] || "bg-category-desconhecido"
      } text-accent-foreground`}
      variant="outline"
    >
      {name}
    </Badge>
  );
}
