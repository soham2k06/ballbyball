"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { UpdatePlayerSchema } from "@/lib/validation/player";

import AlertNote from "../AlertNote";
import EmptyState from "../EmptyState";

import Player from "./Player";
import AddPlayerButton from "./AddPlayer";
import AddEditPlayerFormDialog from "./AddUpdatePlayerDialog";
import PlayerStats from "./PlayerStats";
import { Player as PlayerType } from "@prisma/client";
import { useActionMutate } from "@/lib/hooks";
import { deletePlayer } from "@/lib/actions/player";
import PlayerMatches from "./PlayerMatches";
import { toast } from "sonner";

function PlayerList({ players }: { players: PlayerType[] }) {
  const [playerData, setPlayerData] = useState<PlayerType[]>(players);
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
        {playerData?.length ? (
          <ul className="grid grid-cols-2 gap-2 pb-4 md:grid-cols-4 lg:grid-cols-6">
            {playerData.map((player) => {
              return (
                <Player
                  key={player.id}
                  player={player}
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
        <AddPlayerButton
          setPlayerData={
            setPlayerData as React.Dispatch<
              React.SetStateAction<(PlayerType | undefined)[]>
            >
          }
        />
      </div>
      <AddEditPlayerFormDialog
        open={!!playerToUpdate}
        setOpen={() =>
          setPlayerToUpdate(playerToUpdate ? undefined : playerToUpdate)
        }
        setPlayerData={
          setPlayerData as React.Dispatch<
            React.SetStateAction<(PlayerType | undefined)[]>
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
            if (playerToDelete.includes("optimistic"))
              return toast.error(
                "Error deleting player, please reload and try again",
              );
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
                    ] as PlayerType[],
                );
                toast.error("Failed to delete player");
              },
            });
          }
        }}
      />

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
