import MatchSkeleton from "@/features/matches/skeleton";

function Loading() {
  return (
    <div>
      <h2 className="mb-4 text-3xl font-semibold tracking-tight max-sm:text-xl">
        Matches
      </h2>
      <ul className="grid grid-cols-1 gap-2 pt-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array(3)
          .fill(0)
          .map((_, i) => (
            <MatchSkeleton key={i} />
          ))}
      </ul>
    </div>
  );
}

export default Loading;
