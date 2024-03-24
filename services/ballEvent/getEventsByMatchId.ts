import { BallEvent, Match } from "@prisma/client";
import { axiosInstance } from "../axiosInstance";

export const getEventsByMatchId = async (
  id: Match["id"] | null | undefined,
) => {
  try {
    if (!id) throw new Error("Ball Events not found");

    const res = await axiosInstance.get(`/ball-events/${id}`);
    if (res.status !== 200) {
      throw new Error("Network response was not ok");
    }
    return res.data as BallEvent[];
  } catch (error) {
    console.error("Error while fetching a ball events:", error);
    throw new Error((error as Error).message);
  }
};
