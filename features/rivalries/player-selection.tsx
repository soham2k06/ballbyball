import React from "react";

import { Cross1Icon } from "@radix-ui/react-icons";

import { PlayerSimplified } from "@/types";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type QueryType = string | null;
type SetQueryType = React.Dispatch<React.SetStateAction<string | null>>;

interface PlayerSelectionProps {
  players: PlayerSimplified[];
  batsman: QueryType;
  setBatsman: SetQueryType;
  bowler: QueryType;
  setBowler: SetQueryType;
  player: QueryType;
  setPlayer: SetQueryType;
  setAllState: SetQueryType;
}

function ClearButton({
  val,
  onClick,
}: {
  val: QueryType;
  onClick: React.MouseEventHandler;
}) {
  return (
    !!val && (
      <Button
        className="absolute right-2 top-1/2 size-6 -translate-y-1/2 p-0"
        variant="ghost"
        onClick={onClick}
      >
        <Cross1Icon className="size-3" />
      </Button>
    )
  );
}

function PlayerSelection({
  players,
  batsman,
  setBatsman,
  bowler,
  setBowler,
  player,
  setPlayer,
  setAllState,
}: PlayerSelectionProps) {
  const batsmanOptions = players.filter((p) => p.id !== bowler);
  const bowlerOptions = players.filter((p) => p.id !== batsman);

  return (
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
          <div className="relative">
            <SelectTrigger id="rivalries-player" hideIcon={!!player}>
              <SelectValue placeholder="Select a player" />
            </SelectTrigger>
            <ClearButton val={player} onClick={() => setPlayer(null)} />
          </div>
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
            <div className="relative">
              <SelectTrigger id="rivalries-batsman" hideIcon={!!batsman}>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <ClearButton val={batsman} onClick={() => setBatsman(null)} />
            </div>
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
            <div className="relative">
              <SelectTrigger id="rivalries-bowler" hideIcon={!!bowler}>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <ClearButton val={bowler} onClick={() => setBowler(null)} />
            </div>
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
        >
          Swap
        </Button>
      </div>
    </div>
  );
}

export default PlayerSelection;
