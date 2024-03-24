import { Team } from "@prisma/client";
import { axiosInstance } from "../axiosInstance";
import { TeamWithPlayers } from "@/types";

export const getTeamById = async (id: Team["id"]) => {
  try {
    if (!id) throw new Error("Teams not found");

    const res = await axiosInstance.get(`/teams/${id}`);

    if (res.status !== 200) {
      throw new Error("Network response was not ok");
    }

    return res.data as TeamWithPlayers;
  } catch (error) {
    console.error("Error while fetching a team:", error);
    throw new Error((error as Error).message);
  }
};
