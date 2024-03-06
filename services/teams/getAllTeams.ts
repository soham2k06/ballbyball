import { axiosInstance } from "../axiosInstance";

export const getAllTeams = async () => {
  try {
    const res = await axiosInstance.get("/teams");
    if (res.status !== 200) {
      throw new Error("Network response was not ok");
    }
    return res.data;
  } catch (error) {
    console.error("Error while fetching teams:", error);
    throw error;
  }
};
