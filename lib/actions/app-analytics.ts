"use server";

import { Analytics, AnalyticsModule } from "@prisma/client";

import getCachedSession from "@/lib/auth/session";

import prisma from "../db/prisma";

export async function addAnalytics({
  event,
  property,
  module,
}: Pick<Analytics, "event" | "property" | "module">) {
  if (process.env.NODE_ENV !== "production") return;

  const session = await getCachedSession();

  function isInvalidModule(module: string) {
    return (
      AnalyticsModule[module as keyof typeof AnalyticsModule] === undefined
    );
  }

  await prisma.analytics.create({
    data: {
      userId: session?.user?.id,
      event,
      property,
      module: isInvalidModule(module) ? "other" : module,
    },
  });
}
