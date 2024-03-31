"use client";

import { useState } from "react";
import { useAllPlayers, useDeletePlayer } from "@/apiHooks/player";
import { truncStr } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import AddEditPlayerFormDialog from "./AddEditPlayerDialog";
import { Player } from "@prisma/client";

function PlayerList() {
  const { players } = useAllPlayers();
  const { deletePlayer, isPending } = useDeletePlayer();
  const [deletingPlayerId, setDeletingPlayerId] = useState<string | null>(null);

  const [playerToUpdate, setPlayerToUpdate] = useState<Player | undefined>(
    undefined,
  );

  const handleDeletePlayer = (playerId: string) => {
    setDeletingPlayerId(playerId);
    deletePlayer(playerId);
  };

  return (
    <div className="grid grid-cols-6 gap-2">
      {players?.map((player) => (
        <Card key={player.id}>
          <CardHeader>
            <CardTitle>{truncStr(player.name as string, 10)}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setPlayerToUpdate(player)}>Edit</Button>
            {isPending && deletingPlayerId === player.id ? (
              <Button disabled>Deleting...</Button>
            ) : (
              <Button onClick={() => handleDeletePlayer(player.id)}>
                Delete
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
      <AddEditPlayerFormDialog
        open={!!playerToUpdate}
        setOpen={() =>
          setPlayerToUpdate(playerToUpdate ? undefined : playerToUpdate)
        }
        playerToUpdate={playerToUpdate}
      />
    </div>
  );
}

export default PlayerList;
