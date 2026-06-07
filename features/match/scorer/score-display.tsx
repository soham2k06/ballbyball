import { cn, getOverStr, abbreviateEntity } from "@/lib/utils";

import { Separator } from "@/components/ui/separator";
import { TypographyH2 } from "@/components/ui/typography";

function ScoreDisplay({
  runs,
  wickets,
  totalBalls,
  runRate,
  curTeam,
  chaseMode,
  showChaseDetails,
  onToggleChaseDetails,
  runsNeeded,
  ballsRemaining,
  rrr,
}: {
  runs: number;
  wickets: number;
  totalBalls: number;
  runRate: number;
  curTeam?: string;
  chaseMode?: boolean;
  showChaseDetails?: boolean;
  onToggleChaseDetails?: () => void;
  runsNeeded?: number;
  ballsRemaining?: number;
  rrr?: number;
}) {
  const statsRow = (
    <div className="relative flex h-7 items-center justify-center text-base font-medium text-muted-foreground md:text-lg">
      <div
        className={cn(
          "absolute flex items-center whitespace-nowrap transition-opacity duration-300",
          chaseMode && showChaseDetails ? "opacity-0" : "opacity-100",
        )}
      >
        <span>({getOverStr(totalBalls)})</span>
        <Separator
          orientation="vertical"
          className="mx-2 h-4 bg-muted-foreground"
        />
        <span>RR: {runRate}</span>
      </div>
      {chaseMode && (
        <div
          className={cn(
            "absolute flex items-center whitespace-nowrap transition-opacity duration-300",
            showChaseDetails ? "opacity-100" : "opacity-0",
          )}
        >
          <span>
            {runsNeeded} runs from {ballsRemaining} balls
          </span>
          <Separator
            orientation="vertical"
            className="mx-2 h-4 bg-muted-foreground"
          />
          <span>RRR: {rrr}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="relative mt-6 flex items-end justify-center pb-2">
      {curTeam && (
        <TypographyH2 className="absolute left-0">
          {abbreviateEntity(curTeam)}
        </TypographyH2>
      )}
      <div>
        <h2 className="mb-3 text-center text-6xl font-semibold tabular-nums">
          {runs}/{wickets}
        </h2>
        {chaseMode ? (
          <button onClick={onToggleChaseDetails} className="w-full">
            {statsRow}
          </button>
        ) : (
          statsRow
        )}
      </div>
    </div>
  );
}

export default ScoreDisplay;
