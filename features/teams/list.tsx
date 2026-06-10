"use client";

import { useEffect, useRef, useState } from "react";

import { Player } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";

import { getTeamsQueryOptions } from "@/api-hooks/use-teams";
import { useDeleteTeam, useTeams } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { UpdateTeamSchema } from "@/lib/validation/team";
import { TeamWithPlayers } from "@/types";

import AddTeam from "@/features/teams/add-team";

import AlertNote from "@/components/alert-note";
import EmptyState from "@/components/empty-state";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import AddUpdateTeamDialog from "./add-update-team-dialog";
import TeamBuilder from "./team-builder";
import TeamCard from "./team-card";
import TeamPlayers from "./team-players";

const PAGE_SIZES = [10, 20, 50];

function getPaginationPages(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (current >= total - 3)
    return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}

function TeamList({ userRef }: { userRef: string | null }) {
  const qc = useQueryClient();

  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(20),
  );
  const [sort, setSort] = useQueryState(
    "sort",
    parseAsString.withDefault("desc"),
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

  const { teams, teamsCount, isLoading } = useTeams({
    page: String(page),
    pageSize: String(pageSize),
    sort,
    search,
    userRef,
  });
  const { mutate: deleteMutate, isPending } = useDeleteTeam();

  const [teamToDelete, setTeamToDelete] = useState<string | undefined>();
  const [teamToUpdate, setTeamToUpdate] = useState<
    (UpdateTeamSchema & { matchId: string | null }) | undefined
  >();
  const [showingTeam, setShowingTeam] = useState<
    | { name: string; players: Player[]; captainId: string | null }
    | undefined
  >(undefined);
  const [openTeam, setOpenTeam] = useState(false);

  const totalPages = Math.max(1, Math.ceil(teamsCount / pageSize));
  const pages = getPaginationPages(page, totalPages);

  const prefetchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handlePrefetchEnter(p: number) {
    prefetchTimer.current = setTimeout(() => {
      if (p < 1 || p > totalPages) return;
      qc.prefetchQuery(
        getTeamsQueryOptions({
          page: String(p),
          pageSize: String(pageSize),
          sort,
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

  function handleDelete(id: string) {
    setTeamToDelete(id);
    deleteMutate(id, {
      onSettled() {
        setTeamToDelete(undefined);
      },
    });
  }

  function handleUpdateClick(_: unknown, team: TeamWithPlayers) {
    setTeamToUpdate({
      playerIds: team.players?.map((player) => player.id) ?? [],
      ...team,
    });
  }

  function handlePageSizeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setPageSize(parseInt(e.target.value));
    setPage(1);
  }

  function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSort(e.target.value);
    setPage(1);
  }

  const isEmpty = !isLoading && !teams.length;

  if (isLoading && !teams.length) {
    return (
      <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: Math.min(pageSize, 12) }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-md" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn({ "flex flex-col": isEmpty })}>
      {!userRef && (
        <div className="max-sm:grid max-sm:gap-2 sm:space-x-2">
          <TeamBuilder />
          <AddTeam />
        </div>
      )}

      <div className="mt-4 flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Search teams..."
          value={inputSearch}
          onChange={(e) => setInputSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={sort} onChange={handleSortChange} className="w-40">
          <option value="desc">Latest first</option>
          <option value="asc">Oldest first</option>
        </Select>
      </div>

      {teams.length ? (
        <>
          <ul className="mt-4 grid w-full grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
            {teams.map((team, i) => (
              <TeamCard
                key={team.id}
                team={team}
                setTeamToDelete={setTeamToDelete}
                setShowingTeam={setShowingTeam}
                userRef={userRef}
                handleUpdateClick={(team) => handleUpdateClick(i, team)}
                setOpen={setOpenTeam}
              />
            ))}
          </ul>

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
                {Math.min(page * pageSize, teamsCount)} of {teamsCount}
              </span>
            </div>

            <Pagination className="mx-0 w-auto justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    aria-disabled={page <= 1}
                    className={cn(
                      page <= 1 && "pointer-events-none opacity-50",
                    )}
                    onMouseEnter={() => handlePrefetchEnter(page - 1)}
                    onMouseLeave={handlePrefetchLeave}
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) setPage(page - 1);
                    }}
                  />
                </PaginationItem>

                {pages.map((p, i) =>
                  p === "…" ? (
                    <PaginationItem key={`ellipsis-${i}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href="#"
                        isActive={p === page}
                        onMouseEnter={() => handlePrefetchEnter(p)}
                        onMouseLeave={handlePrefetchLeave}
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(p);
                        }}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    aria-disabled={page >= totalPages}
                    className={cn(
                      page >= totalPages && "pointer-events-none opacity-50",
                    )}
                    onMouseEnter={() => handlePrefetchEnter(page + 1)}
                    onMouseLeave={handlePrefetchLeave}
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < totalPages) setPage(page + 1);
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </>
      ) : (
        <EmptyState document="teams" />
      )}

      {!userRef && (
        <>
          <AddUpdateTeamDialog
            open={!!teamToUpdate}
            setOpen={() =>
              setTeamToUpdate(teamToUpdate ? undefined : teamToUpdate)
            }
            teamToUpdate={teamToUpdate}
          />
          <AlertNote
            open={!!teamToDelete}
            setOpen={() =>
              setTeamToDelete(teamToDelete ? undefined : teamToDelete)
            }
            content="Removing team may lead to bugs if the team is included in matches. Do you still want to continue?"
            onConfirm={() => teamToDelete && handleDelete(teamToDelete)}
            isLoading={isPending}
          />
        </>
      )}

      <TeamPlayers
        showingTeam={showingTeam}
        open={openTeam}
        onClose={() => {
          setOpenTeam(false);
          setTimeout(() => setShowingTeam(undefined), 200);
        }}
      />
    </div>
  );
}

export default TeamList;
