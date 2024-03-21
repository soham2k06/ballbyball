import { Metadata } from "next";
import AddPlayerButton from "@/components/players/AddPlayer";
import PlayerList from "@/components/players/PlayerList";

export const metadata: Metadata = {
  title: "Players - Ball By Ball",
  description: "List of players",
};

async function page() {
  return (
    <>
      <PlayerList />
      <AddPlayerButton />
    </>
  );
}

export default page;
