import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

function MatchSkeleton() {
  return (
    <Skeleton className="h-[162px] overflow-hidden sm:h-[170px]">
      <Card className="bg-transparent">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>
            <Skeleton className="h-7 w-16 bg-muted-foreground"></Skeleton>
          </CardTitle>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-16 bg-muted-foreground"></Skeleton>
            <Skeleton className="h-10 w-10 bg-muted-foreground"></Skeleton>
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-6 w-32 bg-muted-foreground"></Skeleton>
          <Skeleton className="mt-6 h-6 w-44 bg-muted-foreground"></Skeleton>
        </CardContent>
      </Card>
    </Skeleton>
  );
}

export default MatchSkeleton;
