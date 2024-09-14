import { Skeleton } from "@/components/ui/skeleton";

export function Stat({
  data,
  dataKey,
  showStar,
  isLoading,
}: {
  dataKey: string;
  data: number | string | undefined;
  showStar?: boolean;
  isLoading?: boolean;
}) {
  return (
    <div className="bg-muted p-2">
      <h5 className="font-semibold uppercase text-muted-foreground max-md:text-sm">
        {dataKey}
      </h5>
      {isLoading ? (
        <Skeleton className="h-8 w-20 max-md:h-7" />
      ) : (
        <p className="text-2xl font-bold max-md:text-xl">
          {data}
          {showStar && "*"}
        </p>
      )}
    </div>
  );
}
