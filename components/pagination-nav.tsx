"use client";

import { getCompactPaginationPages, getPaginationPages } from "@/lib/pagination";
import { cn } from "@/lib/utils";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type PaginationNavProps = {
  page: number;
  totalPages: number;
  // eslint-disable-next-line no-unused-vars
  onPageChange: (page: number) => void;
  // eslint-disable-next-line no-unused-vars
  onPrefetchEnter?: (page: number) => void;
  onPrefetchLeave?: () => void;
  className?: string;
};

// Renders two `Pagination` instances — a compact one (1, 2, …, last) shown
// below `sm`, and the full sliding-window one shown from `sm` up — so the
// page-number list never overflows narrow viewports.
function PaginationNav({
  page,
  totalPages,
  onPageChange,
  onPrefetchEnter,
  onPrefetchLeave,
  className,
}: PaginationNavProps) {
  const fullPages = getPaginationPages(page, totalPages);
  const compactPages = getCompactPaginationPages(page, totalPages);

  function renderPageItems(pages: (number | "…")[]) {
    return pages.map((p, i) =>
      p === "…" ? (
        <PaginationItem key={`ellipsis-${i}`}>
          <PaginationEllipsis />
        </PaginationItem>
      ) : (
        <PaginationItem key={p}>
          <PaginationLink
            href="#"
            isActive={p === page}
            onMouseEnter={() => onPrefetchEnter?.(p)}
            onMouseLeave={onPrefetchLeave}
            onClick={(e) => {
              e.preventDefault();
              onPageChange(p);
            }}
          >
            {p}
          </PaginationLink>
        </PaginationItem>
      ),
    );
  }

  const prev = (
    <PaginationItem>
      <PaginationPrevious
        href="#"
        aria-disabled={page <= 1}
        className={cn(page <= 1 && "pointer-events-none opacity-50")}
        onMouseEnter={() => onPrefetchEnter?.(page - 1)}
        onMouseLeave={onPrefetchLeave}
        onClick={(e) => {
          e.preventDefault();
          if (page > 1) onPageChange(page - 1);
        }}
      />
    </PaginationItem>
  );

  const next = (
    <PaginationItem>
      <PaginationNext
        href="#"
        aria-disabled={page >= totalPages}
        className={cn(page >= totalPages && "pointer-events-none opacity-50")}
        onMouseEnter={() => onPrefetchEnter?.(page + 1)}
        onMouseLeave={onPrefetchLeave}
        onClick={(e) => {
          e.preventDefault();
          if (page < totalPages) onPageChange(page + 1);
        }}
      />
    </PaginationItem>
  );

  return (
    <>
      <Pagination
        className={cn("mx-0 w-auto justify-end sm:hidden", className)}
      >
        <PaginationContent>
          {prev}
          {renderPageItems(compactPages)}
          {next}
        </PaginationContent>
      </Pagination>
      <Pagination
        className={cn("mx-0 hidden w-auto justify-end sm:flex", className)}
      >
        <PaginationContent>
          {prev}
          {renderPageItems(fullPages)}
          {next}
        </PaginationContent>
      </Pagination>
    </>
  );
}

export default PaginationNav;
