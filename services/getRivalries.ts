import { RivalriesResult } from "@/types";
import { axiosInstance } from "./axiosInstance";

export interface GetRivalriesParams {
  user: string | null;
  player?: string | null;
  batsman?: string | null;
  bowler?: string | null;
  all?: boolean | null;
}

export const getRivalries = async ({
  user,
  player,
  batsman,
  bowler,
  all,
}: GetRivalriesParams) => {
  try {
    const res = await axiosInstance.get<RivalriesResult[]>("rivalries", {
      params: { user, player, batsman, bowler, all },
    });

    if (res.status !== 200) throw new Error("Network response was not ok");

    return res.data;
  } catch (error) {
    console.error("Error while fetching rivalries:", error);
    throw new Error((error as Error).message);
  }
};
