import { axiosInstance } from "../axiosInstance";

export const deleteTeam = async (id: string) => {
  try {
    const res = await axiosInstance.delete("/teams/" + id);

    if (res.status !== 200) throw new Error("Network response was not ok");

    return res.data;
  } catch (error) {
    console.error("Error while deleting a team:", error);
    throw new Error((error as Error).message);
  }
};
