import { axiosInstance } from "../axiosInstance";
import { PlayerStats } from "@/types";

export const getPlayerStats = async (id: string | null | undefined) => {
  try {
    if (!id) throw new Error("Player not found");

    const res = await axiosInstance.get(`/players/stats/${id}`);
    if (res.status !== 200) throw new Error("Network response was not ok");

    return res.data as PlayerStats;
  } catch (error) {
    console.error("Error while fetching a player:", error);
    throw new Error((error as Error).message);
  }
};
