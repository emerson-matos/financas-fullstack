import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
type DataTablePaginationProps = {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  setPageIndex: (pageIndex: number) => void;
  setPageSize: (pageSize: number) => void;
};
export function DataTablePagination({
  pageIndex,
  pageSize,
  totalCount,
  setPageIndex,
  setPageSize,
}: DataTablePaginationProps) {
  return (
    <div className="flex items-center justify-between space-x-2 py-4">
      <div className="flex items-center space-x-2">
        <p className="hidden text-sm text-muted-foreground sm:block">
          Mostrando {pageIndex * pageSize + 1} até{" "}
          {Math.min((pageIndex + 1) * pageSize, totalCount)} de {totalCount} no
          total
        </p>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => {
            setPageSize(Number(value));
            setPageIndex(0);
          }}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {[5, 10, 20, 30, 40, 50, 100].map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPageIndex(pageIndex - 1)}
          disabled={pageIndex === 0}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Voltar Página</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPageIndex(pageIndex + 1)}
          disabled={pageIndex >= Math.ceil(totalCount / pageSize) - 1}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Próxima Página</span>
        </Button>
      </div>
    </div>
  );
}
