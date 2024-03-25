import { axiosInstance } from "../axiosInstance";
import { MatchExtended } from "@/types";

export const getAllMatches = async () => {
  try {
    const res = await axiosInstance.get("/matches");
    if (res.status !== 200) {
      throw new Error("Network response was not ok");
    }
    return res.data as MatchExtended[];
  } catch (error) {
    console.error("Error while fetching teams:", error);
    throw new Error((error as Error).message);
  }
};
