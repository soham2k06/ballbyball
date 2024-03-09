import { axiosInstance } from "../axiosInstance";
import { CreatePlayerSchema } from "@/lib/validation/player";

export const createMultiplePlayers = async (
  data: CreatePlayerSchema["name"][],
) => {
  try {
    const res = await axiosInstance.post("/players/createMultiple", data);

    if (res.status !== 201) {
      throw new Error("Network response was not ok");
    }

    return res.data;
  } catch (error) {
    console.error("Error while creating a players:", error);
    throw new Error((error as Error).message);
  }
};
