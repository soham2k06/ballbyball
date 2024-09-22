import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function MatchSkeleton() {
  return (
    <Card className="bg-transparent">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>
          <Skeleton className="h-7 w-16 bg-muted-foreground/20"></Skeleton>
        </CardTitle>
        <div className="flex items-center space-x-4">
          <Skeleton className="size-9 bg-muted-foreground/20"></Skeleton>
          <Skeleton className="size-9 bg-muted-foreground/20"></Skeleton>
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-6 w-32 bg-muted-foreground/20"></Skeleton>
        <Skeleton className="mt-6 h-6 w-44 bg-muted-foreground/20"></Skeleton>
      </CardContent>
    </Card>
  );
}

export default MatchSkeleton;
