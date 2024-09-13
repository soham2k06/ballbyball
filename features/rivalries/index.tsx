"use client";

import { useQueryState } from "nuqs";

import { useRivalries } from "@/apiHooks/useRivalries";
import { PlayerSimplified } from "@/types";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import RivalryCard from "./rivalry-card";
import RivalryCardSkeleton from "./rivalry-card-skeleton";
import { Button } from "@/components/ui/button";

function RivalriesList({
  players,
  all,
}: {
  players: PlayerSimplified[];
  all: string;
}) {
  const [player, setPlayer] = useQueryState("player");
  const [batsman, setBatsman] = useQueryState("batsman");
  const [bowler, setBowler] = useQueryState("bowler");
  const [allState, setAllState] = useQueryState("all");

  const batsmanOptions = players.filter((p) => p.id !== bowler);
  const bowlerOptions = players.filter((p) => p.id !== batsman);

  const { rivalries, isFetching } = useRivalries({
    player,
    batsman,
    bowler,
    all: allState === "true",
  });

  return (
    <div className="p-1">
      <div className="mb-4 grid grid-cols-1 gap-1 sm:grid-cols-[1fr_2fr] sm:gap-4">
        <div>
          <Label htmlFor="rivalries-player">Player</Label>
          <Select
            value={player ?? ""}
            onValueChange={(val) => {
              setBatsman(null);
              setBowler(null);
              setAllState(null);
              setPlayer(val);
            }}
          >
            <SelectTrigger id="rivalries-player">
              <SelectValue placeholder="Select a player" />
            </SelectTrigger>
            <SelectContent align="start">
              {players.map((player) => (
                <SelectItem key={player.id} value={player.id}>
                  {player.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-full items-end gap-1 sm:grid sm:grid-cols-[3fr_3fr_1fr] sm:gap-4">
          <div className="w-full">
            <Label htmlFor="rivalries-batsman">Batsman</Label>
            <Select
              value={batsman ?? ""}
              onValueChange={(val) => {
                setAllState(null);
                setPlayer(null);
                setBatsman(val);
              }}
            >
              <SelectTrigger id="rivalries-batsman">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent align="center">
                {batsmanOptions.map((player) => (
                  <SelectItem key={player.id} value={player.id}>
                    {player.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full">
            <Label htmlFor="rivalries-bowler">Bowler</Label>
            <Select
              value={bowler ?? ""}
              onValueChange={(val) => {
                setAllState(null);
                setPlayer(null);
                setBowler(val);
              }}
            >
              <SelectTrigger id="rivalries-bowler">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent align="end">
                {bowlerOptions.map((player) => (
                  <SelectItem key={player.id} value={player.id}>
                    {player.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            disabled={!(batsman && bowler)}
            onClick={() => {
              setBatsman(bowler);
              setBowler(batsman);
            }}
            className="shrink-0 max-sm:w-16"
          >
            Swap
          </Button>
        </div>
      </div>
      {isFetching ? (
        <ul className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <RivalryCardSkeleton key={i} />
          ))}
        </ul>
      ) : rivalries?.length ? (
        <ul className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
          {rivalries.map((rivalry) => (
            <RivalryCard
              key={`${rivalry.batsmanId}-${rivalry.bowlerId}`}
              rivalry={rivalry}
              player={player}
            />
          ))}
        </ul>
      ) : (
        <p>
          {!!player || !!batsman || !!bowler || !!all
            ? "No rivalry found for the selected players. Please select a player and batsman/bowler to see their head-to-head stats."
            : "Select player or batsman/bowler to proceed."}
        </p>
      )}
    </div>
  );
}

export default RivalriesList;
