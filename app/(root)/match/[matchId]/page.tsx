import { Metadata } from "next";
import ScorerLayout from "@/components/scorer/ScorerLayout";

export const metadata: Metadata = {
  title: "Match - Ball By Ball",
  description: "List of players",
};

export default function Home({ params }: { params: { matchId: string } }) {
  return (
    <div className="flex h-full flex-col items-center md:justify-center">
      <ScorerLayout matchId={params.matchId} />
    </div>
  );
}
