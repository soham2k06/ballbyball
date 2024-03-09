"use client";

import { useAllPlayers } from "@/hooks/api/player/useAllPlayers";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { truncStr } from "@/lib/utils";

function PlayerList() {
  const { players } = useAllPlayers();
  return (
    <ul className="grid grid-cols-6 gap-2">
      {players?.map((player) => (
        <li key={player.id}>
          <Card>
            <CardHeader>
              <CardTitle>{truncStr(player.name as string, 10)}</CardTitle>
            </CardHeader>
          </Card>
        </li>
      ))}
    </ul>
  );
}

export default PlayerList;
