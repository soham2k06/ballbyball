import { axiosInstance } from "../axiosInstance";
import { TeamWithPlayers } from "@/types";

export const getAllTeams = async () => {
  try {
    const res = await axiosInstance.get("/teams");
    if (res.status !== 200) {
      throw new Error("Network response was not ok");
    }
    return res.data as TeamWithPlayers[];
  } catch (error) {
    console.error("Error while fetching teams:", error);
    throw new Error((error as Error).message);
  }
};
