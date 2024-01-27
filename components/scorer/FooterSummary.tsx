import { Separator } from "../ui/separator";

function FooterSummary({
  curOverRuns,
  curOverWickets,
  extras,
}: {
  curOverRuns: number;
  curOverWickets: number;
  extras: number;
}) {
  return (
    <div className="bg-muted text-primary w-full left-0 rounded-md flex items-center p-2">
      <span>Extras: {extras}</span>
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
