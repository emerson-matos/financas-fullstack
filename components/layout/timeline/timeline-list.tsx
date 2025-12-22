"use client";

import { useTimeline } from "@/hooks/use-timeline";
import { TimelineItem } from "@/components/layout/timeline/timeline-item";
import { Calendar, Clock, Loader2 } from "lucide-react";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEffect, useRef, useState } from "react";
import type { TimelineEntry } from "@/lib/types";

interface TimelineListProps {
  accountId?: string;
  onItemClick?: (id: string, entry: TimelineEntry) => void;
  limit?: number;
}

export function TimelineList({
  accountId,
  onItemClick,
  limit,
}: TimelineListProps) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useTimeline({ accountId, size: limit || 20 });

  const intersectionRef = useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: "400px",
        threshold: 0,
      },
    );

    if (intersectionRef.current) {
      observer.observe(intersectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage && !limit) {
      fetchNextPage();
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage, limit]);

  const getEventDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Hoje";
    if (isYesterday(date)) return "Ontem";
    return format(date, "d 'de' MMMM, yyyy", { locale: ptBR });
  };

  const allEntries = data?.pages.flatMap((page) => page.content) || [];

  // If limit is provided, only take that many
  const entriesToShow = limit ? allEntries.slice(0, limit) : allEntries;

  const groupedEntries = entriesToShow.reduce(
    (groups, entry) => {
      const dateLabel = getEventDateLabel(entry.event_time);
      if (!groups[dateLabel]) groups[dateLabel] = [];
      groups[dateLabel].push(entry);
      return groups;
    },
    {} as Record<string, TimelineEntry[]>,
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Clock className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-linear-to-b before:from-muted before:via-muted before:to-transparent">
      {Object.entries(groupedEntries).map(([date, items]) => (
        <div key={date} className="relative space-y-4">
          <div className="flex items-center gap-4">
            <div className="z-10 flex h-10 w-10 items-center justify-center rounded-full bg-background ring-2 ring-muted shadow-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-semibold tracking-tight text-muted-foreground uppercase">
              {date}
            </h3>
          </div>

          <div className="ml-12 space-y-4">
            {items.map((item) => (
              <TimelineItem
                key={item.id}
                item={item}
                onItemClick={
                  onItemClick ? () => onItemClick(item.id, item) : undefined
                }
              />
            ))}
          </div>
        </div>
      ))}

      {/* Trigger element for Infinite Scroll - hide if limit is set */}
      {!limit && (
        <div
          ref={intersectionRef}
          className="flex min-h-1 min-w-full justify-center py-10"
        >
          {isFetchingNextPage ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : hasNextPage ? (
            <p className="text-xs text-muted-foreground italic">
              Carregando mais histórias...
            </p>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              O início da sua jornada.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
