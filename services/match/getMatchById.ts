import { axiosInstance } from "../axiosInstance";
import { MatchWithTeams } from "@/types";

export const getMatchById = async (id: string) => {
  try {
    if (!id) throw new Error("Match not found");

    const res = await axiosInstance.get(`/matches/${id}`);
    if (res.status !== 200) {
      throw new Error("Network response was not ok");
    }
    return res.data as MatchWithTeams;
  } catch (error) {
    console.error("Error while fetching a match:", error);
    throw new Error((error as Error).message);
  }
};
