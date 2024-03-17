import { EventType } from "@/types";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { invalidBalls } from "./constants";

// ** FRONTEND ** //

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Filtered out wicket(-1)
// If event is no ball(-3), add run came from no ball and 1 run for no ball
// Else return an event and ensure to convert wide(-2) to 1 run
// Sum all the runs
export const calcRuns = (
  ballEvents: EventType[] | string[],
  forPlayer?: boolean,
  isBowling?: boolean,
) =>
  ballEvents
    ?.filter((ball) => ball !== "-1")
    ?.map((event) =>
      event.includes("-3")
        ? (Number(event.slice(2)) + Number(!forPlayer)).toString()
        : event.replace("-2", "1"),
    )
    .reduce((acc, cur) => acc + Number(cur), 0);

export const calcWickets = (ballEvents: EventType[] | string[]) =>
  ballEvents?.filter((ball) => ball === "-1").length;

export const getIsInvalidBall = (ball: EventType) =>
  !invalidBalls.includes(ball) && !ball.includes("-3");

export const truncStr = (str: string, n: number) => {
  return str.length > n ? str.substring(0, n - 1) + "..." : str;
};

// ** BACKEND ** //
