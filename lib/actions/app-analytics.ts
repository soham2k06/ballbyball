"use server";

import { Analytics, AnalyticsModule } from "@prisma/client";

import getCachedSession from "@/lib/auth/session";

import prisma from "../db/prisma";

async function getUserLocation() {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error getting country", error);
    return "Unknown";
  }
}

function getDeviceType(ua: string) {
  if (/tablet|ipad/i.test(ua)) return "Tablet";
  if (/mobile|iphone|android/i.test(ua)) return "Mobile";
  return "Desktop";
}

function getUserOs(ua: string) {
  if (/windows/i.test(ua)) return "Windows";
  if (/macintosh|mac os x/i.test(ua)) return "MacOS";
  if (/linux/i.test(ua)) return "Linux";
  if (/android/i.test(ua)) return "Android";
  if (/iphone|ipad|ipod/i.test(ua)) return "iOS";

  return "Unknown";
}

function getBrowser(ua: string) {
  if (/chrome|chromium|crios/i.test(ua)) return "Chrome";
  if (/firefox|fxios/i.test(ua)) return "Firefox";
  if (/safari/i.test(ua) && !/chrome/i.test(ua)) return "Safari";
  if (/edge/i.test(ua)) return "Edge";
  if (/opera|opr/i.test(ua)) return "Opera";

  return "Unknown";
}

export async function addAnalytics({
  event,
  property,
  module,
  ua,
}: Pick<Analytics, "event" | "property" | "module"> & {
  ua?: string;
}) {
  if (process.env.NODE_ENV !== "production") return;

  const session = await getCachedSession();

  function isInvalidModule(module: string) {
    return (
      AnalyticsModule[module as keyof typeof AnalyticsModule] === undefined
    );
  }

  const userLocation = await getUserLocation();
  const userDeviceType = ua ? getDeviceType(ua) : "Unknown";
  const userOs = ua ? getUserOs(ua) : "Unknown";
  const userBrowser = ua ? getBrowser(ua) : "Unknown";

  await prisma.analytics.create({
    data: {
      userId: session?.user?.id,
      event,
      property,
      module: isInvalidModule(module) ? "other" : module,
      ...(event === "page_view"
        ? {
            country: userLocation.country_name,
            city: userLocation.city,
            device: userDeviceType,
            os: userOs,
            browser: userBrowser,
          }
        : {}),
    },
  });
}
