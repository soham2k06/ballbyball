import { axiosInstance } from "../axiosInstance";
import { PlayerMatches, PlayerStats } from "@/types";

export const getPlayerStats = async (
  id: string | null | undefined,
  user: string | null,
) => {
  try {
    if (!id) throw new Error("Player not found");

    const res = await axiosInstance.get<PlayerStats>(`/players/stats/${id}`, {
      params: { user },
    });
    if (res.status !== 200) throw new Error("Network response was not ok");

    return res.data;
  } catch (error) {
    console.error("Error while fetching a player:", error);
    throw new Error((error as Error).message);
  }
};

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
