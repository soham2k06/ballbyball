import TeamList from "@/components/teams/TeamList";
import { auth } from "@clerk/nextjs";
import { toast } from "sonner";

async function Teams() {
  const { userId } = auth();
  if (!userId) {
    toast.error("User not authenticated");
    return;
  }

  return <TeamList />;
}

export default Teams;
