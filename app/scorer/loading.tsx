import { MoreVertical } from "lucide-react";

import ScoreButtonsSkeleton from "@/features/match/score-buttons/skeleton";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

function Loading() {
  return (
    <div className="flex h-full flex-col items-center md:justify-center">
      <Card className="relative max-sm:w-full max-sm:border-0 sm:w-96 sm:p-2">
        <div className="absolute left-0 top-0 flex w-full items-center justify-between sm:p-2">
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
            <Skeleton className="mx-auto mb-3 h-[60px] w-40" />
            <Skeleton className="h-6 w-60 md:h-7" />
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
