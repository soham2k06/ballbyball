import { TopPerformant } from "@/types";
import { axiosInstance } from "../axiosInstance";
import { TopPerformantPayload } from "@/apiHooks/match/useTopPerformants";

export const getTopPerformants = async ({
  id,
  payload,
}: TopPerformantPayload) => {
  try {
    const res = await axiosInstance.post<TopPerformant[]>(
      `/matches/${id}/top-performants`,
      payload,
    );
    if (res.status !== 200) throw new Error("Network response was not ok");

    return res.data;
  } catch (error) {
    console.error("Error fetching player performants:", error);
    throw new Error((error as Error).message);
  }
};
