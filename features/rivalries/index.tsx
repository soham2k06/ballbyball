"use client";

import { useQueryState } from "nuqs";

import { useRivalries } from "@/api-hooks/use-rivalries";
import { PlayerSimplified } from "@/types";

import { Button } from "@/components/ui/button";

import DatePicker from "../records/date-picker";

import PlayerSelection from "./player-selection";
import RivalryCard from "./rivalry-card";
import RivalryCardSkeleton from "./rivalry-card-skeleton";

function RivalriesList({ players }: { players: PlayerSimplified[] }) {
  const [player, setPlayer] = useQueryState("player");
  const [batsman, setBatsman] = useQueryState("batsman");
  const [bowler, setBowler] = useQueryState("bowler");
  const [allState, setAllState] = useQueryState("all");
  const [date, setDate] = useQueryState("date");

  const { rivalries, isFetching } = useRivalries({
    player,
    batsman,
    bowler,
    all: allState === "true",
    date,
  });

  return (
    <div className="p-1">
      <PlayerSelection
        players={players}
        batsman={batsman}
        bowler={bowler}
        player={player}
        setBatsman={setBatsman}
        setBowler={setBowler}
        setPlayer={setPlayer}
        setAllState={setAllState}
      />
      <div className="mb-6 flex gap-2">
        <DatePicker date={date} setDate={setDate} />
        {!allState && (
          <Button
            onClick={() => {
              setAllState("true");
              setPlayer(null);
              setBatsman(null);
              setBowler(null);
            }}
          >
            Show all rivaries
          </Button>
        )}
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
          {!!player || !!batsman || !!bowler || !!allState
            ? "No rivalry found for the selected players. Please select a player and batsman/bowler to see their head-to-head stats."
            : "Select player or batsman/bowler to proceed."}
        </p>
      )}
    </div>
  );
}

export default RivalriesList;
