import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlayerStats } from "@/types";
import { Stat } from ".";
import { round } from "@/lib/utils";

function MoreBowling({ data }: { data: PlayerStats }) {
  const wicketsTaken = data?.bowling.wickets;
  const ballStrikeRate = (data?.bowling.balls ?? 0) / (wicketsTaken ?? 0);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          More
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>More bowling stats</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-1 overflow-hidden rounded-lg">
          <Stat
            data={wicketsTaken ? ballStrikeRate : "-"}
            dataKey="Strike Rate"
          />
          <Stat data={data.bowling.dotBalls} dataKey="Dots" />
          <Stat
            data={round(data.bowling.dotBallsRate) + "%"}
            dataKey="Dots rate"
          />
          <Stat data={data.bowling.threeHauls} dataKey="3 wickets" />
          <Stat data={data.bowling.fiveHauls} dataKey="5 wickets" />
          <Stat data={data.bowling.extras} dataKey="Extras" />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default MoreBowling;
