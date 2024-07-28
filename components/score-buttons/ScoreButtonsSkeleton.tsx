import { Button } from "../ui/button";

function ButtonSkeleton() {
  return (
    <Button
      variant="secondary"
      className="h-20 w-full animate-pulse rounded-none text-lg text-muted-foreground"
    />
  );
}

function ScoreButtonsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid w-full grid-cols-4 justify-center gap-[2px] overflow-hidden rounded-md">
        {Array(4)
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
