import { useMemo } from "react";
import { useAccount } from "@/hooks/use-accounts";
import { usePathname } from "next/navigation";
type BreadcrumbItem = {
  title: string;
  link: string;
};
// This allows to add custom title as well
const routeMapping: Record<string, Array<BreadcrumbItem>> = {
  "/dashboard/home": [{ title: "Dashboard", link: "/dashboard/home" }],
  "/dashboard/accounts": [
    { title: "Dashboard", link: "/dashboard/home" },
    { title: "Contas", link: "/dashboard/accounts" },
  ],
  "/dashboard/transactions": [
    { title: "Dashboard", link: "/dashboard/home" },
    { title: "Transações", link: "/dashboard/transactions" },
  ],
  "/dashboard/settings": [
    { title: "Dashboard", link: "/dashboard/home" },
    { title: "Configurações", link: "/dashboard/settings" },
  ],
};
// Move regex outside function to avoid performance issues
const ACCOUNT_ID_REGEX = /\/dashboard\/accounts\/(?:details|edit)\/([^/]+)/;
export function useBreadcrumbs() {
  const pathname = usePathname();
  // Fetch account data if we're on an account details page
  const accountIdMatch = pathname.match(ACCOUNT_ID_REGEX);
  const accountId = accountIdMatch ? accountIdMatch[1] : null;
  // Only call useAccount when we have a valid accountId
  const { data: account } = useAccount(accountId || "");
  const breadcrumbs = useMemo(() => {
    // Check if we have a custom mapping for this exact path
    if (routeMapping[pathname]) {
      return routeMapping[pathname];
    }
    // If no exact match, fall back to generating breadcrumbs from the path
    const segments = pathname.split("/").filter(Boolean);
    return segments.map((segment, index) => {
      const path = `/${segments.slice(0, index + 1).join("/")}`;
      // Special handling for account details/edit pages
      if (account && accountId && segment === accountId) {
        return {
          title: account.identification,
          link: path,
        };
      }
      // Special handling for common segments
      switch (segment) {
        case "dashboard":
          return { title: "Dashboard", link: path };
        case "accounts":
          return { title: "Contas", link: "/dashboard/accounts" };
        case "transactions":
          return { title: "Transações", link: "/dashboard/transactions" };
        case "details":
          return { title: "Detalhes", link: path };
        case "edit":
          return { title: "Editar", link: path };
        default:
          return {
            title: segment.charAt(0).toUpperCase() + segment.slice(1),
            link: path,
          };
      }
    });
  }, [pathname, account, accountId]);
  return breadcrumbs;
}
