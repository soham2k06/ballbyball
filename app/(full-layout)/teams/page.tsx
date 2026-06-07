import { Metadata } from "next";

import { checkSession } from "@/lib/utils";

import TeamList from "@/features/teams/list";

export const metadata: Metadata = {
  title: "Teams | BallByBall",
  description: "Add, edit, and delete teams. List of all teams.",
};

interface Props {
  searchParams: Promise<{ user?: string }>;
}

async function Teams({ searchParams }: Props) {
  const { user: userRef } = await searchParams;
  if (!userRef) await checkSession();

  return (
    <div className="w-full">
      <h1 className="mb-4 text-3xl font-semibold tracking-tight max-sm:text-xl">
        Teams
      </h1>
      <TeamList userRef={userRef ?? null} />
    </div>
  );
}

export default Teams;
