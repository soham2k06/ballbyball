import { axiosInstance } from "../axiosInstance";

export const deleteMatch = async (id: string) => {
  try {
    const res = await axiosInstance.delete("/matches/" + id);

    if (res.status !== 200) throw new Error("Network response was not ok");

    return res.data;
  } catch (error) {
    console.error("Error while deleting a match:", error);
    throw new Error((error as Error).message);
  }
};
