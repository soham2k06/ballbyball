import { EventType } from "@/types";
import { Separator } from "../ui/separator";
import FullOverSummary from "./FullOverSummary";
import OverStats from "./OverStats";

function FooterSummary({
  curOverRuns,
  curOverWickets,
  extras,
  runRate,
  chartSummaryData,
  overSummaries,
}: {
  curOverRuns: number;
  curOverWickets: number;
  extras: number;
  runRate: number;
  chartSummaryData: { runs: number }[];
  overSummaries: EventType[][];
}) {
  // manual batman selection
  // manual bowler selection
  // all over summaries
  // run per over chart
  return (
    <div className="flex w-full items-center justify-between rounded-md bg-muted p-2 text-lg text-muted-foreground">
      {/* <div className="flex items-center">
        <span>Extras: {extras}</span>
        <Separator
          orientation="vertical"
          className="mx-2 h-6 bg-muted-foreground"
        />
        <span>
          This Over: {curOverRuns || 0}/{curOverWickets || 0}
        </span>
      </div> */}

      <div className="flex gap-2">
        <OverStats
          runRate={runRate as number}
          chartSummaryData={chartSummaryData}
        />
        <FullOverSummary overSummaries={overSummaries} />
      </div>
    </div>
  );
}

export default FooterSummary;
