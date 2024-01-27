import { cn } from "@/lib/utils";
import { EventType } from "@/types";
import { cva } from "class-variance-authority";
import { Dot } from "lucide-react";

function BallSummary({
  event,
  size = "default",
}: {
  event: EventType;
  size?: "sm" | "default";
}) {
  const summaryVariants = cva(
    "text-center rounded flex justify-center items-center",
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
        size: {
          sm: "h-7 w-full min-w-7 text-sm",
          default: "h-10 w-full min-w-10",
        },
      },
      defaultVariants: { variant: "default" },
    }
  );

  let summaryToShow;

  switch (event) {
    case "0":
      summaryToShow = (
        <Dot
          size={size === "sm" ? 20 : 32}
          strokeWidth={6}
          className="text-muted-foreground"
        />
      );
      break;
    case "-1":
      summaryToShow = "W";
      break;
    case "-2":
      summaryToShow = "Wd";
      break;

    default:
      summaryToShow = event;
      break;
  }

  if (event?.includes("-3")) summaryToShow = event?.replace("-3", "NB");

  return (
    <li
      className={cn(
        summaryVariants({
          variant: event?.includes("-3")
            ? (event.slice(2) as EventType)
            : event,
          size,
        })
      )}
    >
      {summaryToShow}
    </li>
  );
}

export default BallSummary;
