import { Player } from "@prisma/client";
import { axiosInstance } from "../axiosInstance";

export const getPlayerById = async (id: Player["id"] | null | undefined) => {
  try {
    if (!id || id === "dummy") throw new Error("Player not found");

    const res = await axiosInstance.get(`/players/${id}`);
    if (res.status !== 200) {
      throw new Error("Network response was not ok");
    }
    return res.data as Player;
  } catch (error) {
    console.error("Error while fetching a player:", error);
    throw new Error((error as Error).message);
  }
};
