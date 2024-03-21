import ScorerLayout from "@/components/scorer/NormalScorerLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Normal scoring - Ball By Ball",
  description: "List of players",
};

export default function Home() {
  return <ScorerLayout />;
}
