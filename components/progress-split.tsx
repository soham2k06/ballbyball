function ProgressSplit({ points, title }: { points: number[]; title: string }) {
  return (
    <div className="mt-2 flex flex-col items-center justify-center gap-1 sm:gap-2">
      <h4 className="font-medium max-sm:text-sm sm:font-semibold">{title}</h4>
      <div className="flex w-full">
        <div
          className="flex h-4 items-center justify-center rounded-l-md bg-emerald-500 text-xs font-semibold"
          style={{
            width: (points[0] < 10 ? "10" : points[0]) + "%",
          }}
        >
          {points[0]}%
        </div>
        <div
          className="flex h-4 items-center justify-center rounded-r-md bg-amber-500 text-xs font-semibold"
          style={{
            width: (points[1] < 10 ? "10" : points[1]) + "%",
          }}
        >
          {points[1]}%
        </div>
      </div>
    </div>
  );
}

export default ProgressSplit;
