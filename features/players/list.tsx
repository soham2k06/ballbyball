"use client";

import { useEffect, useRef, useState } from "react";

import { DndContext } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";
import { Player } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";
import { toast } from "sonner";

import { getPlayersQueryOptions } from "@/api-hooks/use-players";
import { useDeletePlayer, usePlayers, useSortPlayers } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { UpdatePlayerSchema } from "@/lib/validation/player";

import AlertNote from "@/components/alert-note";
import EmptyState from "@/components/empty-state";
import PaginationNav from "@/components/pagination-nav";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import AddPlayerButton from "./add-player";
import AddEditPlayerFormDialog from "./add-update-player-dialog";
import PlayerCard from "./player-card";
import PlayerStats from "./stats";
import PlayerMatches from "./stats/player-matches";

const PAGE_SIZES = [10, 20, 50];

function PlayerList({ userRef }: { userRef?: string | null }) {
  const qc = useQueryClient();

  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(20),
  );
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  );

  const [inputSearch, setInputSearch] = useState(search);
  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(inputSearch || null);
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputSearch]);
  useEffect(() => {
    setInputSearch(search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const [isSorting, setIsSorting] = useState(false);
  const [playerData, setPlayerData] = useState<Player[]>([]);
  const { mutate: deleteMutate } = useDeletePlayer();

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

  // When sorting, fetch all players so DnD operates on the full list
  const { players, playersCount, isLoading } = usePlayers(
    isSorting
      ? { userRef }
      : { page: String(page), pageSize: String(pageSize), search, userRef },
  );

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

  const totalPages = Math.max(1, Math.ceil(playersCount / pageSize));

  const prefetchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handlePrefetchEnter(p: number) {
    prefetchTimer.current = setTimeout(() => {
      if (p < 1 || p > totalPages) return;
      qc.prefetchQuery(
        getPlayersQueryOptions({
          page: String(p),
          pageSize: String(pageSize),
          search,
          userRef,
        }),
      );
    }, 100);
  }

  function handlePrefetchLeave() {
    if (prefetchTimer.current) {
      clearTimeout(prefetchTimer.current);
      prefetchTimer.current = null;
    }
  }

  function handlePageSizeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setPageSize(parseInt(e.target.value));
    setPage(1);
  }

  const isEmpty = !isLoading && !playerData.length;
  const dndDisabled = isSorting ? false : true;

  if (isLoading && !playerData.length) {
    return (
      <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: Math.min(pageSize, 12) }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-md" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className={cn({ "flex flex-col": isEmpty })}>
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

        {!isSorting && (
          <div className="mt-4 flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Input
              placeholder="Search players..."
              value={inputSearch}
              onChange={(e) => setInputSearch(e.target.value)}
              className="max-w-xs"
            />
          </div>
        )}

        {playerData?.length ? (
          <DndContext
            onDragEnd={(e) => {
              if (dndDisabled) return;
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

        {!isSorting && playerData.length > 0 && (
          <div className="mt-6 flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Rows per page</span>
              <Select
                value={String(pageSize)}
                onChange={handlePageSizeChange}
                className="h-8 w-[70px]"
              >
                {PAGE_SIZES.map((s) => (
                  <option key={s} value={String(s)}>
                    {s}
                  </option>
                ))}
              </Select>
              <span>
                {(page - 1) * pageSize + 1}–
                {Math.min(page * pageSize, playersCount)} of {playersCount}
              </span>
            </div>

            <PaginationNav
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              onPrefetchEnter={handlePrefetchEnter}
              onPrefetchLeave={handlePrefetchLeave}
            />
          </div>
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
