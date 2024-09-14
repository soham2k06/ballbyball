import { PlayerMatches } from "@/types";

import { axiosInstance } from "./axios-instance";

export const getPlayerMatches = async (id: string | null | undefined) => {
  try {
    if (!id) throw new Error("Player not found");

    const res = await axiosInstance.get<PlayerMatches[]>(
      `/players/matches/${id}`,
    );
    if (res.status !== 200) throw new Error("Network response was not ok");

    return res.data;
  } catch (error) {
    console.error("Error while fetching player matches:", error);
    throw new Error((error as Error).message);
  }
};
