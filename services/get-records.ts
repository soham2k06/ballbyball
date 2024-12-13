import { RecordType } from "@/types";

import { axiosInstance } from "./axios-instance";

export const getRecords = async ({
  user,
  date,
  matches,
}: {
  user?: string | null;
  date?: string | null;
  matches?: string | null;
}) => {
  try {
    const res = await axiosInstance.get<RecordType[]>("players/records", {
      params: { user, date, matches },
    });

    if (res.status !== 200) throw new Error("Network response was not ok");

    return res.data;
  } catch (error) {
    console.error("Error while fetching rivalries:", error);
    throw new Error((error as Error).message);
  }
};
