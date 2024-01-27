import { cn } from "@/lib/utils";
import { EventType } from "@/types";
import { cva } from "class-variance-authority";
import { Dot } from "lucide-react";

function BallSummary({
  summary,
  ballLimitInOver,
}: {
  summary: EventType[];
  ballLimitInOver: number;
}) {
  return (
    <ul className="flex gap-1 border-muted rounded-md justify-center border p-2 overflow-x-auto">
      {Array.from({ length: ballLimitInOver }, (_, i) => (
        <Summary key={i} event={summary?.[i]} />
      ))}
    </ul>
  );
}

function Summary({ event }: { event: EventType }) {
  const summaryVariants = cva(
    "size-8 min-w-8 text-center rounded flex justify-center items-center",
    {
      variants: {
        variant: {
          default: "bg-muted",
          "0": "bg-muted text-muted flex justify-center items-center",
          "1": "bg-muted text-primary",
          "2": "bg-muted text-primary",
          "3": "bg-muted text-primary",
          "4": "bg-emerald-500 text-emerald-50 dark:bg-emerald-600 font-extrabold",
          "6": "bg-amber-400 text-amber-950 dark:bg-amber-600 dark:text-amber-50 font-extrabold",
          "-2": "bg-muted text-muted-foreground",
          "-3": "bg-muted text-muted-foreground",
          "-1": "bg-destructive text-destructive-foreground font-extrabold",
        },
      },
      defaultVariants: { variant: "default" },
    }
  );

  let summaryToShow;

  switch (event) {
    case "0":
      summaryToShow = (
        <Dot size={40} strokeWidth={6} className="text-muted-foreground" />
      );
      break;
    case "-1":
      summaryToShow = "W";
      break;
    case "-2":
      summaryToShow = "Wd";
      break;
    case "-3":
      summaryToShow = "NB";
      break;

    default:
      summaryToShow = event;
      break;
  }

  return (
    <li className={cn(summaryVariants({ variant: event }))}>{summaryToShow}</li>
  );
}

export default BallSummary;
