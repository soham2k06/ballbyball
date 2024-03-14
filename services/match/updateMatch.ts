import { UpdateMatchSchema } from "@/lib/validation/match";
import { axiosInstance } from "../axiosInstance";

export const udpateMatch = async (data: UpdateMatchSchema) => {
  try {
    const res = await axiosInstance.put("/matches", data);

    if (res.status !== 202) {
      throw new Error("Network response was not ok");
    }

    return res.data;
  } catch (error) {
    console.error("Error while updating a Match:", error);
    throw new Error((error as Error).message);
  }
};
