import AddPlayerButton from "@/app/(root)/players/AddPlayer";

import { Card, CardHeader, CardTitle } from "@/components/ui/card";

import prisma from "@/lib/db/prisma";
import { truncStr } from "@/lib/utils";
import { auth, clerkClient } from "@clerk/nextjs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Players - Ball By Ball",
  description: "List of players",
};

async function page() {
  const { userId } = auth();
  if (!userId) throw new Error("User not found.");
  const { firstName, lastName } = await clerkClient.users.getUser(userId);

  const players = await prisma.player.findMany({ where: { userId } });

  return (
    <>
      <ul className="grid grid-cols-6 gap-2">
        {players.map((player) => (
          <li key={player.id}>
            <Card>
              <CardHeader>
                <CardTitle>{truncStr(player.name as string, 10)}</CardTitle>
              </CardHeader>
              {/* <CardContent>{player.desc}</CardContent> */}
            </Card>
          </li>
        ))}
      </ul>
      <AddPlayerButton />
    </>
  );
}

export default page;
