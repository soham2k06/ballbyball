import { Metadata } from "next";

import ScorerLayout from "@/features/match/scorer/instant-layout";

export const metadata: Metadata = {
  title: "Instant scoring - BallByBall",
  description:
    "Experience seamless cricket scoring with BallByBall's Main Scorer Page. Instantly input scores, view real-time updates, and access detailed analytics. Keep every match memorable and accurate with our comprehensive scoring tools. Sign in and start scoring for free today!",
};

export default function Home() {
  return <ScorerLayout />;
}
