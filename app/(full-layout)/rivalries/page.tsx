import { Metadata } from "next";

import { checkSession } from "@/lib/utils";

import RivalriesList from "@/features/rivalries";

export const metadata: Metadata = {
  title: "Rivalries - Ballbyball",
  description: "Explore the biggest rivalries between your players.",
};

interface Props {
  searchParams: Promise<{ user?: string }>;
}

async function Rivalries({ searchParams }: Props) {
  const { user: userRef } = await searchParams;
  if (!userRef) await checkSession();

  return (
    <>
      <div className="mb-4">
        <h1 className="text-3xl font-semibold tracking-tight max-sm:text-xl">
          Rivalries
        </h1>
        <p className="text-sm text-muted-foreground">
          Select player or batsman/bowler to see their head-to-head stats.
        </p>
      </div>
      <RivalriesList />
    </>
  );
}

export default Rivalries;
