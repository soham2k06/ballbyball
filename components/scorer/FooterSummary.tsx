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
  chartSummaryData: { runs: number; wickets: number }[];
  overSummaries: EventType[][];
}) {
  return (
    <div className="bg-muted w-full text-lg text-muted-foreground rounded-md flex items-center p-2 justify-between">
      <div className="flex items-center">
        <span>Extras: {extras}</span>
        <Separator
          orientation="vertical"
          className="bg-muted-foreground h-6 mx-2"
        />
        <span>
          This Over: {curOverRuns || 0}/{curOverWickets || 0}
        </span>
      </div>

      <div className="gap-2 flex">
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
