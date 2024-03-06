import type { Metadata } from "next";
import StartMatch from "@/components/start-a-match/StartMatch";
import BackButton from "@/components/BackButton";

export const metadata: Metadata = {
  title: "Start a match - Ball By Ball",
  description: "List of players",
};

function page() {
  return (
    <div>
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-3xl font-semibold tracking-tight max-sm:text-xl">
          Start a match
        </h2>
        <BackButton />
      </div>
      <StartMatch />
    </div>
  );
}

export default page;
