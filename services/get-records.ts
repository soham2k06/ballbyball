import {
  BattingRecordsType,
  BowlingRecordsType,
  PlayerPerformance,
} from "@/types";

import { axiosInstance } from "./axios-instance";

export const getRecords = async ({
  user,
  date,
  recordType,
}: {
  user?: string | null;
  date?: string | null;
  recordType?: string | null;
}) => {
  try {
    const res = await axiosInstance.get<
      (
        | BattingRecordsType
        | BowlingRecordsType
        | (PlayerPerformance & {
            name: string;
            matches: number;
          })
      )[]
    >("players/records", {
      params: { user, date, recordType },
    });

    if (res.status !== 200) throw new Error("Network response was not ok");

    return res.data;
  } catch (error) {
    console.error("Error while fetching rivalries:", error);
    throw new Error((error as Error).message);
  }
};
