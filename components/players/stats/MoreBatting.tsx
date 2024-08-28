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

function MoreBatting({ data }: { data: PlayerStats }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          More
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>More batting stats</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-1 overflow-hidden rounded-lg">
          <Stat data={data.batting.fours} dataKey="Fours" />
          <Stat data={data.batting.sixes} dataKey="Sixes" />
          <Stat
            data={round(data.batting.boundaryRate) + "%"}
            dataKey="Bndry. Rate"
          />
          <Stat data={data.batting.dotsPlayed} dataKey="Dots" />
          <Stat data={data.batting.singles} dataKey="Singles" />
          <Stat data={data.batting.twos} dataKey="Doubles" />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default MoreBatting;
