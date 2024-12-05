"use client";

import { useState } from "react";

import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { Player } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  deletePlayer,
  sortPlayers as sortPlayersAPI,
} from "@/lib/actions/player";
import { useActionMutate } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { UpdatePlayerSchema } from "@/lib/validation/player";

import AlertNote from "@/components/alert-note";
import EmptyState from "@/components/empty-state";

import AddPlayerButton from "./add-player";
import AddEditPlayerFormDialog from "./add-update-player-dialog";
import PlayerCard from "./player-card";
import PlayerStats from "./stats";
import PlayerMatches from "./stats/player-matches";

function PlayerList({
  players,
  userRef,
}: {
  players: Player[];
  userRef?: string | null;
}) {
  const [playerData, setPlayerData] = useState<Player[]>(players);
  const { mutate: deleteMutate } = useActionMutate(deletePlayer);

  const [isSorting, setIsSorting] = useState(false);

  const [playerToDelete, setPlayerToDelete] = useState<string | undefined>();

  const [playerToUpdate, setPlayerToUpdate] = useState<
    UpdatePlayerSchema | undefined
  >();

  const [playerMatchesOpen, setPlayerMatchesOpen] = useState<
    string | undefined
  >();

  const [openedPlayer, setOpenedPlayer] = useState<{
    id: string | undefined;
    name: string | undefined;
  }>();

  const { mutate: sortPlayers, isPending } = useMutation({
    mutationFn: sortPlayersAPI,
  });

  function handleSort() {
    sortPlayers(
      {
        players: playerData,
      },
      {
        onSuccess: () => {
          setIsSorting(false);
          toast.success("Players sorted successfully");
        },
        onError: () => {
          toast.error("Failed to sort players");
        },
      },
    );
  }

  return (
    <>
      <div
        className={cn({
          "flex flex-col items-center md:p-8": !playerData?.length,
        })}
      >
        {!userRef && (
          <AddPlayerButton
            isSorting={isSorting}
            setIsSorting={setIsSorting}
            setPlayerData={
              setPlayerData as React.Dispatch<
                React.SetStateAction<(Player | undefined)[]>
              >
            }
            handleSort={handleSort}
            isSortPending={isPending}
          />
        )}
        {playerData?.length ? (
          <DndContext
            onDragEnd={(e) => {
              const target = e.over?.id as string;
              const from = e.active?.id as string;

              if (from && target && from !== target)
                setPlayerData((prevData) => {
                  // Find the indexes of the players being moved
                  const targetIndex = prevData.findIndex(
                    (player) => player?.id === target,
                  );
                  const fromIndex = prevData.findIndex(
                    (player) => player?.id === from,
                  );

                  // If the indexes are valid and different, perform the swap
                  if (
                    targetIndex !== -1 &&
                    fromIndex !== -1 &&
                    targetIndex !== fromIndex
                  ) {
                    const newPlayerData = [...prevData];
                    // Remove the player at fromIndex and insert it at targetIndex
                    const [movedPlayer] = newPlayerData.splice(fromIndex, 1);
                    newPlayerData.splice(targetIndex, 0, movedPlayer);

                    // Optionally update the order for each player
                    return newPlayerData.map((player, index) => ({
                      ...player,
                      order: index + 1, // Assign sequential order starting from 1
                    }));
                  }

                  // Return the previous state if no changes are needed
                  return prevData;
                });
            }}
          >
            <SortableContext items={playerData}>
              <ul className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
                {playerData.map((player) => {
                  return (
                    <PlayerCard
                      isSorting={isSorting}
                      key={player.id}
                      player={player}
                      userRef={userRef}
                      setPlayerToDelete={setPlayerToDelete}
                      setPlayerToUpdate={setPlayerToUpdate}
                      setOpenedPlayer={setOpenedPlayer}
                      setPlayerMatchesOpen={setPlayerMatchesOpen}
                    />
                  );
                })}
              </ul>
            </SortableContext>
          </DndContext>
        ) : (
          <EmptyState document="players" />
        )}
      </div>
      {!userRef && (
        <>
          <AddEditPlayerFormDialog
            open={!!playerToUpdate}
            setOpen={() =>
              setPlayerToUpdate(playerToUpdate ? undefined : playerToUpdate)
            }
            setPlayerData={
              setPlayerData as React.Dispatch<
                React.SetStateAction<(Player | undefined)[]>
              >
            }
            playerToUpdate={playerToUpdate}
          />
          <AlertNote
            open={!!playerToDelete}
            setOpen={() =>
              setPlayerToDelete(playerToDelete ? undefined : playerToDelete)
            }
            noLoading
            content="Removing players may lead to bugs if the player is included in any matches. Do you still want to continue?"
            onConfirm={() => {
              if (playerToDelete) {
                setPlayerData((prevData) =>
                  prevData.filter((player) => player?.id !== playerToDelete),
                );

                deleteMutate(playerToDelete, {
                  onError: () => {
                    setPlayerData(
                      (prevData) =>
                        [
                          ...prevData,
                          playerData.find(
                            (player) => player?.id === playerToDelete,
                          ),
                        ] as Player[],
                    );
                    toast.error("Failed to delete player");
                  },
                });
              }
            }}
          />
        </>
      )}
      <PlayerStats
        openedPlayer={openedPlayer}
        setOpenedPlayer={() => setOpenedPlayer(undefined)}
      />
      <PlayerMatches
        playerId={playerMatchesOpen}
        setPlayerMatchesOpen={() => setPlayerMatchesOpen(undefined)}
      />
    </>
  );
}

export default PlayerList;
