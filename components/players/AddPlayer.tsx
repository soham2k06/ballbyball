"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import AddPlayerFormDialog from "./AddUpdatePlayerDialog";
import AddMultiplePlayersDialog from "./AddMultiplePlayersDialog";

function AddPlayerButton() {
  const [open, setOpen] = useState(false);

  const [openMultiple, setOpenMultiple] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Add Player</Button>
      <Button onClick={() => setOpenMultiple(true)}>Add Multiple Player</Button>

      <AddPlayerFormDialog open={open} setOpen={setOpen} />
      <AddMultiplePlayersDialog open={openMultiple} setOpen={setOpenMultiple} />
    </>
  );
}

export default AddPlayerButton;
