import { axiosInstance } from "../axiosInstance";
import { CreateTeamSchema } from "@/lib/validation/team";

export const updateTeam = async (data: CreateTeamSchema) => {
  try {
    const res = await axiosInstance.put("/teams", data);

    if (res.status !== 200) throw new Error("Network response was not ok");

    return res.data;
  } catch (error) {
    console.error("Error while updating a team:", error);
    throw new Error((error as Error).message);
  }
};
