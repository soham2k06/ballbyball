import { Player } from "@prisma/client";
import { axiosInstance } from "../axiosInstance";

export const getPlayersByIds = async (
  ids: Player["id"][][] | null | undefined,
) => {
  try {
    if (!ids) throw new Error("Players not found");

    const res = await axiosInstance.post(`/players/getMultiple`, { ids });
    if (res.status !== 200) {
      throw new Error("Network response was not ok");
    }
    return res.data as Player[][];
  } catch (error) {
    console.error("Error while fetching a player:", error);
    throw new Error((error as Error).message);
  }
};
