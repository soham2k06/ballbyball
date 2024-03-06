import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import Link from "next/link";

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

      <Link href="/start-a-match">
        <Button>Start a match</Button>
      </Link>
    </div>
  );
}

export default page;
