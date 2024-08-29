import prisma from "@/lib/db/prisma";
import { getValidatedUser } from "@/lib/utils";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BowlingRecords from "@/components/records/bowling-records";
import BattingRecords from "@/components/records/batting-records";
import { Suspense } from "react";
import RecordsSkeleton from "@/components/records/records-skeleton";

async function Records() {
  const userId = await getValidatedUser();

  const players = await prisma.player.findMany({
    where: { userId },
    include: {
      playerBallEvents: true,
      playerBatEvents: true,
    },
  });

  return (
    <>
      <BattingRecords players={players} />
      <BowlingRecords players={players} />
    </>
  );
}

function RecordsPage() {
  return (
    <div>
      <h1 className="mb-4 text-3xl font-semibold tracking-tight max-sm:text-xl">
        Records
      </h1>
      <Tabs defaultValue="runs" className="m-1">
        <TabsList className="mb-4">
          <TabsTrigger value="runs">Most Runs</TabsTrigger>
          <TabsTrigger value="wickets">Most Wickets</TabsTrigger>
        </TabsList>
        <Suspense fallback={<RecordsSkeleton />}>
          <Records />
        </Suspense>
      </Tabs>
    </div>
  );
}

export default RecordsPage;
