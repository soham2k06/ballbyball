import React from "react";

import { PlayerSimplified } from "@/types";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

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
          onChange={(e) => {
            setAllState(null);
            setBatsman(null);
            setBowler(null);
            setPlayer(e.target.value);
          }}
        >
          <option value="">None*</option>
          {players.map((player) => (
            <option key={player.id} value={player.id}>
              {player.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex w-full items-end gap-1 sm:grid sm:grid-cols-[3fr_3fr_1fr] sm:gap-4">
        <div className="w-full">
          <Label htmlFor="rivalries-batsman">Batsman</Label>
          <Select
            value={batsman ?? ""}
            onChange={(e) => {
              setAllState(null);
              setPlayer(null);
              setBatsman(e.target.value);
            }}
          >
            <option value="">None*</option>
            {batsmanOptions.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-full">
          <Label htmlFor="rivalries-bowler">Bowler</Label>

          <Select
            value={bowler ?? ""}
            onChange={(e) => {
              setAllState(null);
              setPlayer(null);
              setBowler(e.target.value);
            }}
          >
            <option value="">None*</option>
            {bowlerOptions.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
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
