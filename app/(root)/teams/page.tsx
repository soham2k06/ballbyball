import { auth } from "@clerk/nextjs";
import { toast } from "sonner";
import TeamList from "@/components/teams/TeamList";

async function Teams() {
  const { userId } = auth();
  if (!userId) {
    toast.error("User not authenticated");
    return;
  }

  return <TeamList />;
}

export default Teams;
