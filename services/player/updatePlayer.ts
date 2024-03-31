import { UpdatePlayerSchema } from "@/lib/validation/player";
import { axiosInstance } from "../axiosInstance";

export const updatePlayer = async (data: UpdatePlayerSchema) => {
  try {
    const res = await axiosInstance.put("/players/" + data.id, data);

    if (res.status !== 200) throw new Error("Network response was not ok");

    return res.data;
  } catch (error) {
    console.error("Error while updating a player:", error);
    throw new Error((error as Error).message);
  }
};
