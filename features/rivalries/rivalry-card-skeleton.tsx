import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function RivalryCardSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-0 max-sm:pb-0">
        <Skeleton className="mb-1 h-6 w-2/3 sm:h-6" />
        <Skeleton className="h-5 w-1/4 sm:h-4" />
      </CardHeader>
      <CardContent>
        <ul className="text-xs sm:text-sm">
          <li className="flex items-center justify-between">
            <h6 className="font-semibold">Runs</h6>
            <Skeleton className="h-3 w-7 rounded-sm sm:h-4" />
          </li>
          <li className="flex items-center justify-between">
            <h6 className="font-semibold">Balls</h6>
            <Skeleton className="h-3 w-7 rounded-sm sm:h-4" />
          </li>
          <li className="flex items-center justify-between">
            <h6 className="font-semibold">Outs</h6>
            <Skeleton className="h-3 w-7 rounded-sm sm:h-4" />
          </li>
          <li className="flex items-center justify-between">
            <h6 className="font-semibold">Strike Rate</h6>
            <Skeleton className="h-3 w-7 rounded-sm sm:h-4" />
          </li>
          <li className="flex items-center justify-between">
            <h6 className="font-semibold">Boundaries</h6>
            <Skeleton className="h-3 w-7 rounded-sm sm:h-4" />
          </li>
          <li className="flex items-center justify-between">
            <h6 className="font-semibold">Dots</h6>
            <Skeleton className="h-3 w-7 rounded-sm sm:h-4" />
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}

export default RivalryCardSkeleton;
