import { useId } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
export function DashboardSkeleton() {
  const cardKeys = Array.from({ length: 4 }, useId);
  const contentKeys = Array.from({ length: 5 }, useId);
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cardKeys.map((key) => (
          <Card key={key} className="overflow-hidden">
            <CardHeader className="gap-2">
              <div className="h-5 w-1/3 animate-pulse rounded bg-muted" />
              <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-1/2 animate-pulse rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 overflow-hidden">
          <CardHeader className="gap-2">
            <div className="h-5 w-1/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="h-[300px] animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
        <Card className="overflow-hidden lg:col-span-3">
          <CardHeader className="gap-2">
            <div className="h-5 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent className="grid gap-4">
            {contentKeys.map((key) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-1/6 animate-pulse rounded bg-muted" />
                </div>
                <div className="h-2 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <div className="h-8 w-full animate-pulse rounded bg-muted" />
          </CardFooter>
        </Card>
      </div>
      <Card className="overflow-hidden">
        <CardHeader className="gap-2">
          <div className="h-5 w-1/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {contentKeys.map((key) => (
              <div key={key} className="flex items-center justify-between p-2">
                <div className="space-y-1">
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                </div>
                <div className="h-4 w-16 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
