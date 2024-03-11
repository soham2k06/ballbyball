import { CreateBallEventSchema } from "@/lib/validation/ballEvent";
import { axiosInstance } from "../axiosInstance";

export const saveBallEvents = async (data: CreateBallEventSchema[]) => {
  try {
    const res = await axiosInstance.post("/ball-events", data);

    if (res.status !== 201) {
      throw new Error("Network response was not ok");
    }

    return res.data;
  } catch (error) {
    console.error("Error while saving events:", error);
    throw new Error((error as Error).message);
  }
};
