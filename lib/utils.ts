import { EventType } from "@/types";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Filtered out wicket(-1)
// If event is no ball(-3), add run came from no ball and 1 run for no ball
// Else return an event and ensure to convert wide(-2) to 1 run
// Sum all the runs
export const calcRuns = (ballEvents: EventType[]) =>
  ballEvents
    ?.filter((ball) => ball !== "-1")
    ?.map((event) =>
      event.includes("-3")
        ? (Number(event.slice(2)) + 1).toString()
        : event.replace("-2", "1"),
    )
    .reduce((acc, cur) => acc + Number(cur), 0);

export const calcWickets = (ballEvents: EventType[]) =>
  ballEvents?.filter((ball) => ball === "-1").length;

export const truncStr = (str: string, n: number) => {
  return str.length > n ? str.substring(0, n - 1) + "..." : str;
};
