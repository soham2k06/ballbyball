"use client";

import { useState } from "react";
import { useAllPlayers, useDeletePlayer } from "@/apiHooks/player";
import { truncStr } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import AddEditPlayerFormDialog from "./AddUpdatePlayerDialog";
import LoadingButton from "../ui/loading-button";
import { UpdatePlayerSchema } from "@/lib/validation/player";
import AlertNote from "../AlertNote";
import { LoaderIcon } from "lucide-react";

function PlayerList() {
  const { players, isFetching } = useAllPlayers();
  const { deletePlayer, isPending } = useDeletePlayer();
  const [playerToDelete, setPlayerToDelete] = useState<string | undefined>(
    undefined,
  );

  const [playerToUpdate, setPlayerToUpdate] = useState<
    UpdatePlayerSchema | undefined
  >(undefined);

  const handleDelete = (playerId: string) => {
    setPlayerToDelete(playerId);
    // deletePlayer(playerId);
  };

  if (isFetching)
    return (
      <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center">
        <LoaderIcon className="animate-spin" />
      </div>
    );

  return (
    <div className="grid grid-cols-6 gap-2">
      {players?.map((player) => {
        const isLoading = isPending && playerToDelete === player.id;
        return (
          <Card key={player.id}>
            <CardHeader>
              <CardTitle>{truncStr(player.name as string, 10)}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setPlayerToUpdate(player)}>Edit</Button>

              <LoadingButton
                loading={isLoading}
                disabled={isLoading}
                onClick={() => handleDelete(player.id)}
              >
                {isLoading ? "Deleting..." : "Delete"}
              </LoadingButton>
            </CardContent>
          </Card>
        );
      })}
      <AddEditPlayerFormDialog
        open={!!playerToUpdate}
        setOpen={() =>
          setPlayerToUpdate(playerToUpdate ? undefined : playerToUpdate)
        }
        playerToUpdate={playerToUpdate}
      />
      <AlertNote
        open={!!playerToDelete}
        setOpen={() =>
          setPlayerToDelete(playerToDelete ? undefined : playerToDelete)
        }
        content="Removing players may lead to bugs if the player is included in any matches. Do you still want to continue?"
        onConfirm={() => playerToDelete && deletePlayer(playerToDelete)}
      />
    </div>
  );
}

export default PlayerList;
