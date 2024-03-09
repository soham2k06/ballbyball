import { CreateMatchSchema } from "@/lib/validation/match";
import { axiosInstance } from "../axiosInstance";

export const createMatch = async (data: CreateMatchSchema) => {
  try {
    const res = await axiosInstance.post("/matches", data);

    if (res.status !== 201) {
      throw new Error("Network response was not ok");
    }

    return res.data;
  } catch (error) {
    console.error("Error while creating a Match:", error);
    throw new Error((error as Error).message);
  }
};
