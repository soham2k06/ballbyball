"use client";

import { useEffect } from "react";

import { usePathname, useSearchParams } from "next/navigation";

import { AnalyticsModule } from "@prisma/client";

import { addAnalytics } from "@/lib/actions/app-analytics";

const pathnames: Record<string, AnalyticsModule> = {
  "/": "home",
  "/matches": "matches",
  "/players": "players",
  "/teams": "teams",
  "/records": "stats",
  "/rivalries": "stats",
  "/scorer": "instant_scorer",
  "/guide": "guide",
};

function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const searchQuery = searchParams.toString();
    const ua = navigator.userAgent;

    addAnalytics({
      event: "page_view",
      property: `${pathname}${searchQuery ? `?${searchQuery}` : ""}`,
      module: pathnames[pathname] || "other",
      ua,
    });
  }, [pathname, searchParams]);

  return null;
}

export default Analytics;
