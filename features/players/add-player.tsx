"use client";

import { useState } from "react";

import { Player } from "@prisma/client";

import { Button } from "@/components/ui/button";

import AddMultiplePlayersDialog from "./add-multiple-player-dialog";
import AddPlayerFormDialog from "./add-update-player-dialog";

function AddPlayerButton({
  setPlayerData,
}: {
  setPlayerData: React.Dispatch<React.SetStateAction<(Player | undefined)[]>>;
}) {
  const [open, setOpen] = useState(false);

  const [openMultiple, setOpenMultiple] = useState(false);

  return (
    <div className="space-x-2">
      <Button onClick={() => setOpen(true)}>Add Player</Button>
      <Button onClick={() => setOpenMultiple(true)} className="relative">
        Add Multiple Players
      </Button>

      <AddPlayerFormDialog
        open={open}
        setOpen={setOpen}
        setPlayerData={setPlayerData}
      />
      <AddMultiplePlayersDialog
        open={openMultiple}
        setOpen={setOpenMultiple}
        setPlayerData={setPlayerData}
      />
    </div>
  );
}

export default AddPlayerButton;
