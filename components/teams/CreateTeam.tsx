"use client";

import { CreateTeamSchema } from "@/lib/validation/team";
import { Button } from "../ui/button";
import { toast } from "sonner";

function CreateTeam() {
  async function onSubmit() {
    const data: CreateTeamSchema = {
      name: "Delhi Capitals",
      playerIds: ["65e5fb5b9e9e52bdca81f308", "65e5fa049e9e52bdca81f307"],
    };

    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Status code: " + res.status);

      toast.success("Team added successfully");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    }
  }

  return <Button onClick={onSubmit}>Create</Button>;
}

export default CreateTeam;
