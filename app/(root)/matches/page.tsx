import MatchList from "@/components/match/MatchList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Matches - Ball By Ball",
  description: "List of players",
};

function page() {
  return (
    <div>
      <h2 className="text-3xl font-semibold tracking-tight max-sm:text-xl">
        Matches
      </h2>
      <p>Start adding matches. They will be saved here.</p>

      <MatchList />
    </div>
  );
}

export default page;
