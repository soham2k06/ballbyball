import { Skeleton } from "@/components/ui/skeleton";

function Loading() {
  return (
    <div>
      <h1 className="mb-4 text-3xl font-semibold tracking-tight max-sm:text-xl">
        Players
      </h1>
      <ul className="grid grid-cols-2 gap-2 pb-4 md:grid-cols-4 lg:grid-cols-6">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-14 sm:h-[72px]" />
          ))}
      </ul>
    </div>
  );
}

export default Loading;
