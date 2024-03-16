import { UpdateMatchSchema } from "@/lib/validation/match";
import { axiosInstance } from "../axiosInstance";

export const udpateMatch = async (data: UpdateMatchSchema) => {
  if (!data) return;

  const dataWithSortedCurPlayers = {
    ...data,
    curPlayers: data.curPlayers.sort(
      (a, b) => a?.type.localeCompare(b?.type!)!,
    ),
  };

  try {
    const res = await axiosInstance.put("/matches", dataWithSortedCurPlayers);

    if (res.status !== 202) {
      throw new Error("Network response was not ok");
    }

    return res.data;
  } catch (error) {
    console.error("Error while updating a Match:", error);
    throw new Error((error as Error).message);
  }
};
