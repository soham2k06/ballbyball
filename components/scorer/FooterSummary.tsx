import { EventType } from "@/types";
import { Separator } from "../ui/separator";
import { calcRuns, calcWickets } from "@/lib/utils";

function FooterSummary({
  curOverSummary,
  balls,
}: {
  curOverSummary: EventType[];
  balls: EventType[];
}) {
  const curOverRuns = calcRuns(curOverSummary);
  const curOverWickets = calcWickets(curOverSummary);

  const extras = balls.filter((ball) => ball === "-2" || ball === "-3");
  return (
    <div className="bg-muted text-primary w-full left-0 rounded-md flex items-center p-2">
      <span>Extras: {extras.length}</span>
      <Separator
        orientation="vertical"
        className="bg-muted-foreground h-6 mx-3"
      />
      <span>
        Current Over: {curOverRuns || 0}/{curOverWickets || 0}
      </span>
    </div>
  );
}

export default FooterSummary;
