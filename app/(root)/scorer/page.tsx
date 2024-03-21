import { Metadata } from "next";
import ScorerLayout from "@/components/scorer/NormalScorerLayout";

export const metadata: Metadata = {
  title: "Normal scoring - Ball By Ball",
  description: "List of players",
};

export default function Home() {
  return <ScorerLayout />;
}
