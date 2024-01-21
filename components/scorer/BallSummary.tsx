import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";
import { Dot } from "lucide-react";

function BallSummary({ summary }: { summary: number | "Wicket" }) {
  const summaryVariants = cva("size-8 min-w-8 leading-8 text-center text-sm", {
    variants: {
      variant: {
        default: "bg-muted",
        0: "bg-muted text-primary flex justify-center items-center",
        1: "bg-primary text-primary-foreground",
        2: "bg-primary text-primary-foreground",
        4: "bg-emerald-500 text-emerald-50 dark:bg-emerald-600",
        6: "bg-amber-400 text-amber-950 dark:bg-amber-600 dark:text-amber-50",
        7: "bg-muted text-muted-foreground",
        8: "bg-muted text-muted-foreground",
        Wicket: "bg-destructive text-destructive-foreground font-black",
      },
    },
    defaultVariants: { variant: "default" },
  });

  //   Refactor this
  if (summary === 0)
    return (
      <li className={summaryVariants({ variant: summary })}>
        <Dot size={40} />
      </li>
    );
  else if (summary === 7)
    return <li className={summaryVariants({ variant: summary })}>NB</li>;
  else if (summary === 8)
    return <li className={summaryVariants({ variant: summary })}>Wd</li>;
  else if (summary === "Wicket")
    return <li className={summaryVariants({ variant: summary })}>W</li>;
  else
    return <li className={summaryVariants({ variant: summary })}>{summary}</li>;
}

export default BallSummary;
