import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useBreadcrumbs } from "@/hooks/use-breadcrumbs";
export function AppBreadcrumb() {
  const items = useBreadcrumbs();
  if (items.length === 0) {
    return null;
  }
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.length > 0 && (
          <Fragment key={items[0].title}>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href={items[0].link}>
                {items[0].title}
              </BreadcrumbLink>
            </BreadcrumbItem>
            {items.length > 1 && (
              <BreadcrumbSeparator className="hidden md:block" />
            )}
          </Fragment>
        )}
        {items.length > 3 && (
          <Fragment key="ellipsis">
            <BreadcrumbItem className="hidden md:block">
              <span className="text-muted-foreground">...</span>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
          </Fragment>
        )}
        {items.slice(-2).map((item, index) => (
          <Fragment key={item.title}>
            {index === 0 && items.length > 2 && (
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={item.link}>{item.title}</BreadcrumbLink>
              </BreadcrumbItem>
            )}
            {index === 0 && items.length > 2 && (
              <BreadcrumbSeparator className="hidden md:block" />
            )}
            {index === 1 && <BreadcrumbPage>{item.title}</BreadcrumbPage>}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
