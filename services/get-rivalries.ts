import { RivalriesResult } from "@/types";

import { axiosInstance } from "./axios-instance";

export interface GetRivalriesParams {
  user: string | null;
  player?: string | null;
  batsman?: string | null;
  bowler?: string | null;
  all?: boolean | null;
  date?: string | null;
}

export const getRivalries = async ({
  user,
  player,
  batsman,
  bowler,
  date,
  all,
}: GetRivalriesParams) => {
  try {
    const res = await axiosInstance.get<RivalriesResult[]>("rivalries", {
      params: { user, player, batsman, bowler, date, all },
    });

    if (res.status !== 200) throw new Error("Network response was not ok");

    return res.data;
  } catch (error) {
    console.error("Error while fetching rivalries:", error);
    throw new Error((error as Error).message);
  }
};
