import { EventType } from "@/types";
import { cva } from "class-variance-authority";
import { Dot } from "lucide-react";

function BallSummary({ summary }: { summary: EventType }) {
  const summaryVariants = cva(
    "size-8 min-w-8 leading-8 text-center rounded-full text-sm",
    {
      variants: {
        variant: {
          default: "bg-muted",
          "0": "bg-muted text-primary flex justify-center items-center",
          "1": "bg-primary text-primary-foreground",
          "2": "bg-primary text-primary-foreground",
          "4": "bg-emerald-500 text-emerald-50 dark:bg-emerald-600",
          "6": "bg-amber-400 text-amber-950 dark:bg-amber-600 dark:text-amber-50",
          "-2": "bg-muted text-muted-foreground",
          "-3": "bg-muted text-muted-foreground",
          "-1": "bg-destructive text-destructive-foreground font-black",
        },
      },
      defaultVariants: { variant: "default" },
    }
  );

  //   Refactor this
  if (summary === "0")
    return (
      <li className={summaryVariants({ variant: "default" })}>
        <Dot size={32} className="text-7xl" />
      </li>
    );
  if (summary === "-3")
    return <li className={summaryVariants({ variant: "-3" })}>NB</li>;
  else if (summary === "-2")
    return <li className={summaryVariants({ variant: "-2" })}>Wd</li>;
  else if (summary === "-1")
    return <li className={summaryVariants({ variant: "-1" })}>W</li>;
  else
    return (
      <li
        className={summaryVariants({
          variant: summary,
        })}
      >
        {summary}
      </li>
    );
}

export default BallSummary;
