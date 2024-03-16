"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import CreateTeamDialog from "./CreateTeamDialog";

function AddPlayerButton() {
  const [open, setOpen] = useState(false);

  // TODO: Create two teams with auto spreading players on two teams

  return (
    <>
      <Button onClick={() => setOpen(true)}>Add team</Button>

      <CreateTeamDialog open={open} setOpen={setOpen} />
    </>
  );
}

export default AddPlayerButton;
