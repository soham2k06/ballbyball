"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import AddPlayerFormDialog from "./AddUpdatePlayerDialog";
import AddMultiplePlayersDialog from "./AddMultiplePlayersDialog";

function AddPlayerButton() {
  const [open, setOpen] = useState(false);

  const [openMultiple, setOpenMultiple] = useState(false);

  return (
    <div className="space-x-2">
      <Button onClick={() => setOpen(true)}>Add Player</Button>
      <Button onClick={() => setOpenMultiple(true)} className="relative">
        Add Multiple Players
      </Button>

      <AddPlayerFormDialog open={open} setOpen={setOpen} />
      <AddMultiplePlayersDialog open={openMultiple} setOpen={setOpenMultiple} />
    </div>
  );
}

export default AddPlayerButton;
