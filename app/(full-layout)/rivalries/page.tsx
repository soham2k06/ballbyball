import { Metadata } from "next";

import Link from "next/link";

import { getAllPlayers } from "@/lib/actions/player";
import { checkSession, getValidatedUser } from "@/lib/utils";

import RivalriesList from "@/features/rivalries";

import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Rivalries - Ballbyball",
  description: "Explore the biggest rivalries between your players.",
};

interface Props {
  searchParams: {
    user: string;
    all: string;
  };
}

async function Rivalries({ searchParams }: Props) {
  const { user: userRef, all } = searchParams;
  if (!userRef) await checkSession();

  const user = userRef ?? (await getValidatedUser());

  const players = await getAllPlayers(user);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight max-sm:text-xl">
            Rivalries
          </h1>
          <p className="text-sm text-muted-foreground">
            Select player or batsman/bowler to see their head-to-head stats.
          </p>
        </div>
        <Link
          href={
            userRef
              ? `/rivalries?user=${userRef}&all=true`
              : `/rivalries?all=true`
          }
          className={buttonVariants({
            size: "sm",
          })}
        >
          Show All
        </Link>
      </div>
      <RivalriesList players={players ?? []} all={all} />
    </div>
  );
}

export default Rivalries;
