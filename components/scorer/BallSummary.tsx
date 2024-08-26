import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { EventType } from "@/types";

function BallSummary({
  event,
  size = "default",
}: {
  event: EventType;
  size?: "sm" | "default";
}) {
  const isNoBall = event?.includes("-3");
  const isWicket = event?.includes("-1");
  const isByes = event?.includes("-5");
  const isWide = event?.includes("-2");
  const summaryVariants = cva(
    "text-center rounded-full flex justify-center items-center",
    {
      variants: {
        variant: {
          default: "bg-muted",
          "0": "bg-muted text-muted-foreground flex justify-center items-center",
          "-4": "bg-muted text-muted-foreground flex justify-center items-center", // Swap Strike change without runs
          "1": "bg-muted text-foreground",
          "2": "bg-muted text-foreground",
          "3": "bg-muted text-foreground",
          "4": "bg-emerald-500 text-emerald-50 dark:bg-emerald-600 font-extrabold",
          "6": "bg-amber-400 text-amber-950 dark:bg-amber-600 dark:text-amber-50 font-extrabold",
          "-2": "bg-muted text-muted-foreground",
          "-3": "bg-muted text-muted-foreground",
          "-5": "bg-muted text-muted-foreground",
          "-1": "bg-destructive text-destructive-foreground font-extrabold",
        },
        size: {
          sm: "h-8 min-w-8 text-sm",
          default: "h-10 min-w-10 max-sm:min-w-8 max-sm:h-8",
        },
      },
      defaultVariants: { variant: "default" },
    },
  );

  let summaryToShow;

  switch (event) {
    case "0":
    case "-4":
      summaryToShow = (
        <span
          className={cn("bg-muted-foreground", {
            "size-3": size === "sm",
            "size-4 max-sm:size-3": size === "default",
            "rounded-full": event === "0",
            "rounded-[2px]": event === "-4",
          })}
        />
      );
      break;

    default:
      summaryToShow = event;
      break;
  }

  if (isWicket) {
    const runsAlongWithRunOut = event.split("_")[3];
    if (runsAlongWithRunOut && runsAlongWithRunOut !== "0")
      summaryToShow = "W" + runsAlongWithRunOut;
    else summaryToShow = "W";
  }
  if (isNoBall) summaryToShow = event?.replace("-3", "NB");
  if (isByes) summaryToShow = event?.replace("-5", "B");
  if (isWide) summaryToShow = event?.replace("-2", "Wd");

  const variant = (
    isNoBall || isByes || isWide ? event.slice(2) : isWicket ? "-1" : event
  ) as EventType;

  return (
    <li
      className={cn(
        summaryVariants({
          variant,
          size,
        }),
      )}
    >
      {summaryToShow}
    </li>
  );
}

export default BallSummary;
