import prisma from "@/lib/db/prisma";
import { checkSession, getValidatedUser } from "@/lib/utils";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BowlingRecords from "@/components/records/bowling-records";
import BattingRecords from "@/components/records/batting-records";
import { Suspense } from "react";
import RecordsSkeleton from "@/components/records/records-skeleton";
import MVP from "@/components/records/mvp";

interface Props {
  searchParams: {
    user: string;
  };
}

async function Records({ searchParams }: Props) {
  const userRef = searchParams.user;
  if (!userRef) await checkSession();

  const userId = userRef ?? (await getValidatedUser());

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
      <MVP players={players} userId={userId} />
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
        <TabsList className="mb-4">
          <TabsTrigger value="runs">Most Runs</TabsTrigger>
          <TabsTrigger value="wickets">Most Wickets</TabsTrigger>
          <TabsTrigger value="mvp">MVP</TabsTrigger>
        </TabsList>
        <Suspense fallback={<RecordsSkeleton />}>
          <Records searchParams={searchParams} />
        </Suspense>
      </Tabs>
    </div>
  );
}

export default RecordsPage;
