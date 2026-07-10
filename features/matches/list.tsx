"use client";

import { useEffect, useRef, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { useQueryState, parseAsInteger, parseAsString } from "nuqs";

import {
  getMatchDetailQueryOptions,
  getMatchesQueryOptions,
} from "@/api-hooks/use-matches";
import { useDeleteMatch, useMatches, useTeams } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { UpdateMatchSchema } from "@/lib/validation/match";

import AlertNote from "@/components/alert-note";
import EmptyState from "@/components/empty-state";
import PaginationNav from "@/components/pagination-nav";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import Match from "./match-card";
import Start from "./start";
import StartUpdateMatchDialog from "./start-update-dialog";

const PAGE_SIZES = [5, 10, 20, 50];

function MatchList() {
  const qc = useQueryClient();

  const [userRef] = useQueryState("user");
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [pageSize, setPageSize] = useQueryState(
    "pageSize",
    parseAsInteger.withDefault(10),
  );
  const [sort, setSort] = useQueryState(
    "sort",
    parseAsString.withDefault("desc"),
  );
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault(""),
  );

  // Local input value that debounces into the `search` URL param
  const [inputSearch, setInputSearch] = useState(search);
  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(inputSearch || null);
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputSearch]);

  // Keep inputSearch in sync if the URL param changes externally (e.g. back/forward)
  useEffect(() => {
    setInputSearch(search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const {
    teams,
    isLoading: isTeamsLoading,
    isFetching: isTeamsFetching,
  } = useTeams();
  const { matches, matchesCount, isLoading } = useMatches({
    page: String(page),
    pageSize: String(pageSize),
    sort,
    search,
    userRef,
  });
  const { mutate: deleteMutate, isPending: isDeleting } = useDeleteMatch();

  const [matchToUpdate, setMatchToUpdate] = useState<
    (UpdateMatchSchema & { teams: { id: string }[] }) | undefined
  >(undefined);
  const [matchToDelete, setMatchToDelete] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(matchesCount / pageSize));

  // Prefetch first 3 match details once the list loads
  useEffect(() => {
    matches.slice(0, 3).forEach((match) => {
      qc.prefetchQuery(getMatchDetailQueryOptions(match.id, userRef));
    });
  }, [matches]);

  const prefetchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handlePrefetchEnter(p: number) {
    prefetchTimer.current = setTimeout(() => {
      if (p < 1 || p > totalPages) return;
      qc.prefetchQuery(
        getMatchesQueryOptions({
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

  function handlePageSizeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setPageSize(parseInt(e.target.value));
    setPage(1);
  }

  function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSort(e.target.value);
    setPage(1);
  }

  const isEmpty = !isLoading && !matches.length;

  return (
    <div className={cn({ "flex flex-col": isEmpty })}>
      {!userRef && (
        <Start
          teams={teams}
          isLoading={isTeamsLoading}
          isFetching={isTeamsFetching}
        />
      )}

      <div className="mt-4 flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Search matches..."
          value={inputSearch}
          onChange={(e) => setInputSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={sort} onChange={handleSortChange} className="w-40">
          <option value="desc">Latest first</option>
          <option value="asc">Oldest first</option>
        </Select>
      </div>

      {isLoading && !matches.length ? (
        <div className="mt-4 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: Math.min(pageSize, 5) }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-md" />
          ))}
        </div>
      ) : isEmpty ? (
        <EmptyState document="matches" />
      ) : (
        <>
          <ul className="mt-4 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {matches.map((match) => (
              <Match
                key={match.id}
                match={match}
                setMatchToDelete={setMatchToDelete}
                setMatchToUpdate={setMatchToUpdate}
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
                {Math.min(page * pageSize, matchesCount)} of {matchesCount}
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
        </>
      )}

      {!userRef && (
        <>
          <StartUpdateMatchDialog
            open={!!matchToUpdate}
            setOpen={() => setMatchToUpdate(undefined)}
            matchToUpdate={matchToUpdate}
            teams={teams}
            isTeamsFetching={isTeamsFetching ?? false}
          />
          <AlertNote
            open={!!matchToDelete}
            setOpen={() =>
              setMatchToDelete(matchToDelete ? null : matchToDelete)
            }
            onConfirm={() => matchToDelete && deleteMutate(matchToDelete)}
            content="Removing matches will lead to removing all team and player stats connected with the match. Do you still want to continue?"
            isLoading={isDeleting}
          />
        </>
      )}
    </div>
  );
}

export default MatchList;
