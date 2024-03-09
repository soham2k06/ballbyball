"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import CreateTeamDialog from "./CreateTeamDialog";

function AddPlayerButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Add team</Button>

      <CreateTeamDialog open={open} setOpen={setOpen} />
    </>
  );
}

export default AddPlayerButton;
