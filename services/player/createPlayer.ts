import { CreatePlayerSchema } from "@/lib/validation/player";
import { axiosInstance } from "../axiosInstance";

export const createPlayer = async (data: CreatePlayerSchema) => {
  try {
    const res = await axiosInstance.post("/players", data);

    if (res.status !== 201) {
      throw new Error("Network response was not ok");
    }

    return res.data;
  } catch (error) {
    console.error("Error while creating a player:", error);
    throw new Error((error as Error).message);
  }
};
