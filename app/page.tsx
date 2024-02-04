import AddPlayerButton from "@/components/players/AddPlayer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import prisma from "@/lib/db/prisma";
import { truncStr } from "@/lib/utils";
import { auth, clerkClient } from "@clerk/nextjs";
import Link from "next/link";

async function page() {
  const { userId } = auth();
  if (!userId) throw new Error("User not found.");
  const { firstName, lastName } = await clerkClient.users.getUser(userId);
  console.log(firstName, lastName);
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
      <Link href="/scorer">
        <Button>Start</Button>
      </Link>
    </>
  );
}

export default page;
