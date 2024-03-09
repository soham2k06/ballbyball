import { Match } from "@prisma/client";
import { axiosInstance } from "../axiosInstance";

export const getAllMatches = async () => {
  try {
    const res = await axiosInstance.get("/matches");
    if (res.status !== 200) {
      throw new Error("Network response was not ok");
    }
    return res.data as Match[];
  } catch (error) {
    console.error("Error while fetching teams:", error);
    throw new Error((error as Error).message);
  }
};
