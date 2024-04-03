import { Metadata } from "next";

import PlayerList from "@/components/players/PlayerList";

export const metadata: Metadata = {
  title: "Players - Ball By Ball",
  description: "List of players",
};

async function page() {
  return <PlayerList />;
}

export default page;
