"use client";

import { useState } from "react";

import { useAllPlayers, useDeletePlayer } from "@/apiHooks/player";
import { cn } from "@/lib/utils";
import { UpdatePlayerSchema } from "@/lib/validation/player";

import AlertNote from "../AlertNote";
import EmptyState from "../EmptyState";

import Player from "./Player";
import AddPlayerButton from "./AddPlayer";
import AddEditPlayerFormDialog from "./AddUpdatePlayerDialog";
import PlayerStats from "./PlayerStats";
import { Skeleton } from "../ui/skeleton";

function PlayerList() {
  const { players, isFetching } = useAllPlayers();
  const { deletePlayer, isPending } = useDeletePlayer();
  const [playerToDelete, setPlayerToDelete] = useState<string | undefined>();

  const [playerToUpdate, setPlayerToUpdate] = useState<
    UpdatePlayerSchema | undefined
  >();

  const [openedPlayer, setOpenedPlayer] = useState<{
    id: string | undefined;
    name: string | undefined;
  }>();

  if (isFetching)
    return (
      <ul className="grid grid-cols-2 gap-2 pb-4 md:grid-cols-4 lg:grid-cols-6">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-14 sm:h-[72px]"></Skeleton>
          ))}
      </ul>
    );

  return (
    <>
      <div
        className={cn({
          "flex flex-col items-center md:p-8": !players?.length,
        })}
      >
        {players?.length ? (
          <ul className="grid grid-cols-2 gap-2 pb-4 md:grid-cols-4 lg:grid-cols-6">
            {players.map((player) => {
              return (
                <Player
                  key={player.id}
                  player={player}
                  setPlayerToDelete={setPlayerToDelete}
                  setPlayerToUpdate={setPlayerToUpdate}
                  setOpenedPlayer={setOpenedPlayer}
                />
              );
            })}
          </ul>
        ) : (
          <EmptyState document="players" />
        )}
        <AddPlayerButton />
      </div>
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
        isLoading={isPending}
        content="Removing players may lead to bugs if the player is included in any matches. Do you still want to continue?"
        onConfirm={() => playerToDelete && deletePlayer(playerToDelete)}
      />

      <PlayerStats
        openedPlayer={openedPlayer}
        setOpenedPlayer={() => setOpenedPlayer(undefined)}
      />
    </>
  );
}

export default PlayerList;
