"use client";

import { useState } from "react";

import { Player } from "@prisma/client";
import { toast } from "sonner";

import { deletePlayer } from "@/lib/actions/player";
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

  return (
    <>
      <div
        className={cn({
          "flex flex-col items-center md:p-8": !playerData?.length,
        })}
      >
        {!userRef && (
          <AddPlayerButton
            setPlayerData={
              setPlayerData as React.Dispatch<
                React.SetStateAction<(Player | undefined)[]>
              >
            }
          />
        )}
        {playerData?.length ? (
          <ul className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
            {playerData.map((player) => {
              return (
                <PlayerCard
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
