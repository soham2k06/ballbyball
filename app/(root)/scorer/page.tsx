import ScorerLayout from "@/components/scorer/ScorerLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Normal scoring - Ball By Ball",
  description: "List of players",
};

export default function Home() {
  // TODO: remove full features for normal scoring
  return (
    <div className="flex h-full flex-col items-center md:justify-center">
      <ScorerLayout matchId="none" />
    </div>
  );
}
