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
    <div className="bg-muted w-full text-lg text-muted-foreground rounded-md flex items-center p-4">
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
