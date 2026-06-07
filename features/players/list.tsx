"use client";

import { useEffect, useState } from "react";

import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { Player } from "@prisma/client";
import { toast } from "sonner";

import { useDeletePlayer, usePlayers, useSortPlayers } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { UpdatePlayerSchema } from "@/lib/validation/player";

import AlertNote from "@/components/alert-note";
import EmptyState from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

import AddPlayerButton from "./add-player";
import AddEditPlayerFormDialog from "./add-update-player-dialog";
import PlayerCard from "./player-card";
import PlayerStats from "./stats";
import PlayerMatches from "./stats/player-matches";

function PlayerList({ userRef }: { userRef?: string | null }) {
  const { players, isLoading } = usePlayers(userRef);
  const [playerData, setPlayerData] = useState<Player[]>([]);
  const { mutate: deleteMutate } = useDeletePlayer();

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

  const { mutate: sortPlayers, isPending } = useSortPlayers();

  useEffect(() => {
    if (!isSorting) setPlayerData(players as Player[]);
  }, [players]);

  function handleSort() {
    sortPlayers(
      { players: playerData },
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

  if (isLoading && !playerData.length) {
    return (
      <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-md" />
        ))}
      </div>
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
                  const targetIndex = prevData.findIndex(
                    (player) => player?.id === target,
                  );
                  const fromIndex = prevData.findIndex(
                    (player) => player?.id === from,
                  );

                  if (
                    targetIndex !== -1 &&
                    fromIndex !== -1 &&
                    targetIndex !== fromIndex
                  ) {
                    const newPlayerData = [...prevData];
                    const [movedPlayer] = newPlayerData.splice(fromIndex, 1);
                    newPlayerData.splice(targetIndex, 0, movedPlayer);
                    return newPlayerData.map((player, index) => ({
                      ...player,
                      order: index + 1,
                    }));
                  }

                  return prevData;
                });
            }}
          >
            <SortableContext items={playerData}>
              <ul className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
                {playerData.map((player) => (
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
                ))}
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
