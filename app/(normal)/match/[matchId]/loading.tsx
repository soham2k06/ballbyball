import ScoreButtonsSkeleton from "@/components/score-buttons/ScoreButtonsSkeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreVertical } from "lucide-react";

function Loading() {
  return (
    <div className="flex h-full flex-col items-center md:justify-center">
      <Card className="relative max-sm:w-full max-sm:border-0 sm:w-96 sm:p-2">
        <div className="absolute left-0 top-0 flex w-full items-center justify-between sm:p-2">
          <Button disabled>Save</Button>
          <Button
            name="danger-actions"
            title="danger-actions"
            size="icon"
            variant="secondary"
            disabled
          >
            <MoreVertical size={20} />
          </Button>
        </div>
        <CardContent className="max-sm:p-0">
          <div className="relative mt-6 flex items-end justify-center pb-2">
            <Skeleton className="absolute left-0 h-8 w-10" />
            <div>
              <Skeleton className="mx-auto mb-3 h-[60px] w-40" />
              <Skeleton className="h-6 w-60 md:h-7" />
            </div>
          </div>

          <ul className="mt-6 flex justify-start gap-2 overflow-x-auto">
            {Array.from({ length: 6 }, (_, i) => (
              <li
                className="flex h-10 min-w-10 items-center justify-center rounded-full bg-muted text-center max-sm:h-8 max-sm:min-w-8"
                key={i}
              />
            ))}
          </ul>
        </CardContent>
        <div className="my-4" />

        {/* Batsmen Stats */}
        <div className="flex w-full flex-col justify-between gap-1 rounded-md bg-muted p-2 text-lg">
          <div className="flex border-b border-muted-foreground/20 pb-1 text-sm font-bold text-muted-foreground">
            <div className="mr-4 w-full max-w-28 text-left text-[13px] uppercase">
              batting
            </div>
            <div className="grid w-full grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 text-xs">
              <div className="text-center">R</div>
              <div className="text-center">B</div>
              <div className="text-center">4s</div>
              <div className="text-center">6s</div>
              <div className="min-w-8 text-center">SR</div>
            </div>
          </div>
          <Skeleton className="h-5 w-full bg-foreground/10" />
          <Skeleton className="h-5 w-full bg-foreground/10" />
        </div>
        <div className="my-2 md:my-4" />
        {/* Bowler Stats */}
        <div className="flex w-full flex-col gap-1 rounded-md bg-muted p-2 text-lg">
          <div className="flex border-b border-muted-foreground/20 pb-1 text-sm font-bold text-muted-foreground">
            <div className="mr-4 w-full max-w-28 text-left text-[13px] uppercase">
              bowling
            </div>
            <div className="grid w-full grid-cols-[1fr_1fr_1fr_auto] gap-2 text-xs">
              <div className="text-center">O</div>
              <div className="text-center">W</div>
              <div className="text-center">R</div>
              <div className="min-w-14 text-center">ECON</div>
            </div>
          </div>
          <Skeleton className="h-5 w-full bg-foreground/10" />
        </div>
        <Separator className="my-3" />
        <ScoreButtonsSkeleton />
        <div className="mt-4 md:mt-6" />
        <div className="flex w-full items-center gap-2 text-lg text-muted-foreground">
          <Button className="w-full">Stats & Settings</Button>
          <Button className="w-full">Scorecard</Button>
        </div>
      </Card>
    </div>
  );
}

export default Loading;
