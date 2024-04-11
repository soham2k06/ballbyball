import { getOverStr, processTeamName } from "@/lib/utils";
import { Separator } from "../ui/separator";
import { TypographyH2 } from "../ui/typography";

function ScoreDisplay({
  runs,
  wickets,
  totalBalls,
  runRate,
  curTeam,
}: {
  runs: number;
  wickets: number;
  totalBalls: number;
  runRate: number;
  curTeam?: string;
}) {
  return (
    <div className="relative flex items-end justify-center pb-2 pt-12">
      <TypographyH2 className="absolute left-0">
        {processTeamName(curTeam ?? "TEAM 1")}
      </TypographyH2>
      <div>
        <h2 className="mb-3 text-center text-6xl font-semibold tabular-nums">
          {runs}/{wickets}
        </h2>
        <div className="flex items-center justify-center text-center text-lg text-muted-foreground">
          <span>({getOverStr(totalBalls)})</span>
          <Separator
            orientation="vertical"
            className="mx-2 h-6 bg-muted-foreground"
          />
          <span>RR: {runRate}</span>
        </div>
      </div>
    </div>
  );
}

export default ScoreDisplay;
