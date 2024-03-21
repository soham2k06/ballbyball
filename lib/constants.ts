import { EventType } from "@/types";

const strikeChangers = ["1", "3", "-4"]; // '-4' is for swap manually without run

export const invalidBalls = ["-3", "-2"];

export const ballEvents: Record<EventType, string> = {
  "-3": "NB",
  "-2": "WD",
  "-1": "W",
  "0": "0",
  "1": "1",
  "2": "2",
  "3": "3",
  "4": "4",
  "6": "6",
};

export { strikeChangers };
