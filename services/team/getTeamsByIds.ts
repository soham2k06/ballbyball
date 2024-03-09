import { Team } from "@prisma/client";
import { axiosInstance } from "../axiosInstance";

export const getTeamsById = async (ids: Team["id"][][]) => {
  try {
    if (!ids) throw new Error("Teams not found");

    const res = await axiosInstance.post("/teams/getMultiple", { ids });

    if (res.status !== 200) {
      throw new Error("Network response was not ok");
    }

    return res.data as Team[][];
  } catch (error) {
    console.error("Error while fetching a team:", error);
    throw new Error((error as Error).message);
  }
};
