import { Suspense } from "react";

import { endOfDay, startOfDay } from "date-fns";

import prisma from "@/lib/db/prisma";
import { checkSession, getValidatedUser } from "@/lib/utils";

import BattingRecords from "@/features/records/batting-records";
import BowlingRecords from "@/features/records/bowling-records";
import DatePicker from "@/features/records/date-picker";
import MVP from "@/features/records/mvp";
import RecordsSkeleton from "@/features/records/records-skeleton";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Props {
  searchParams: {
    user: string;
    date: string | null;
  };
}

async function Records({ searchParams }: Props) {
  const { user: userRef, date } = searchParams;
  if (!userRef) await checkSession();

  const userId = userRef ?? (await getValidatedUser());

  const dateFilter = date
    ? {
        where: {
          Match: {
            createdAt: {
              gte: startOfDay(new Date(date)),
              lte: endOfDay(new Date(date)),
            },
          },
        },
      }
    : true;

  const players = (
    await prisma.player.findMany({
      where: { userId },
      include: {
        playerBallEvents: date ? dateFilter : true,
        playerBatEvents: date ? dateFilter : true,
      },
    })
  ).filter(
    (player) =>
      player.playerBatEvents.length > 0 || player.playerBallEvents.length > 0,
  );

  return (
    <>
      <BattingRecords players={players} />
      <BowlingRecords players={players} />
      <MVP players={players} userId={userId} date={date} />
    </>
  );
}

function RecordsPage({ searchParams }: Props) {
  return (
    <div>
      <h1 className="mb-4 text-3xl font-semibold tracking-tight max-sm:text-xl">
        Records
      </h1>
      <Tabs defaultValue="runs" className="m-1">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <TabsList className="max-sm:w-full">
            <TabsTrigger className="max-sm:w-full" value="runs">
              Most Runs
            </TabsTrigger>
            <TabsTrigger className="max-sm:w-full" value="wickets">
              Most Wickets
            </TabsTrigger>
            <TabsTrigger className="max-sm:w-full" value="mvp">
              MVP
            </TabsTrigger>
          </TabsList>
          <DatePicker />
        </div>
        <Suspense fallback={<RecordsSkeleton />}>
          <Records searchParams={searchParams} />
        </Suspense>
      </Tabs>
    </div>
  );
}

export default RecordsPage;
