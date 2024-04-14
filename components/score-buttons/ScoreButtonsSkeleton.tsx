import { Button } from "../ui/button";

function ButtonSkeleton() {
  return (
    <Button
      variant="secondary"
      className="h-20 w-full animate-pulse text-lg text-muted-foreground"
    >
      NA
    </Button>
  );
}

function ScoreButtonsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex w-full justify-center gap-2">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <ButtonSkeleton key={i} />
          ))}
      </div>

      <div className="flex w-full justify-center gap-2">
        {Array(2)
          .fill(0)
          .map((_, i) => (
            <ButtonSkeleton key={i} />
          ))}
      </div>
      <div className="flex w-full justify-center gap-2">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <ButtonSkeleton key={i} />
          ))}
      </div>
    </div>
  );
}

export default ScoreButtonsSkeleton;
