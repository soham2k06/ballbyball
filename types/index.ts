import { Dispatch, SetStateAction } from "react";

export type EventType = "0" | "1" | "2" | "3" | "4" | "6" | "-1" | "-2" | "-3";

export type OverlayStateProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};
