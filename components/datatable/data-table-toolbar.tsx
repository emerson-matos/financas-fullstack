import { ArrowUpDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category } from "@/lib/types";
type DataTableToolbarProps = {
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  categoryFilter: string | null;
  setCategoryFilter: (value: string | null) => void;
  typeFilter: string | null;
  setTypeFilter: (value: string | null) => void;
  filterOptions?: {
    categories?: Array<Category>;
    showTypeFilters?: boolean;
  };
  refetch: () => void;
};
export function DataTableToolbar({
  globalFilter,
  setGlobalFilter,
  categoryFilter,
  setCategoryFilter,
  typeFilter,
  setTypeFilter,
  filterOptions,
  refetch,
}: DataTableToolbarProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          name="search"
          placeholder="Buscar..."
          className="w-full pl-8 md:w-[300px] lg:w-[400px]"
        />
      </div>
      {filterOptions && (
        <div className="flex items-center gap-2">
          {filterOptions.showTypeFilters && (
            <Select
              value={typeFilter || ""}
              onValueChange={(value) => setTypeFilter(value || null)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="expense">Despesas</SelectItem>
                <SelectItem value="income">Receitas</SelectItem>
              </SelectContent>
            </Select>
          )}
          {filterOptions.categories && (
            <Select
              value={categoryFilter || ""}
              onValueChange={(value) => setCategoryFilter(value || null)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as categorias</SelectItem>
                {filterOptions.categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      )}
      <Button variant="outline" size="icon" onClick={() => refetch()}>
        <ArrowUpDown className="h-4 w-4" />
      </Button>
    </div>
  );
}
