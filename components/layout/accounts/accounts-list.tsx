"use client";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/datatable/app-datatable";
import { columns } from "./columns";
export function AccountList() {
  const router = useRouter();
  return (
    <DataTable
      columns={columns}
      queryKey="accounts"
      onRowClick={(id: string) => {
        router.push(`/dashboard/accounts/${id}`);
      }}
      defaultSort={{ id: "identification", desc: true }}
    />
  );
}
