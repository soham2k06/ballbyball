"use client";

import { useState } from "react";

import { Player } from "@prisma/client";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

import AddMultiplePlayersDialog from "./add-multiple-player-dialog";
import AddPlayerFormDialog from "./add-update-player-dialog";

function AddPlayerButton({
  setPlayerData,
  setIsSorting,
  isSorting,
  handleSort,
  isSortPending,
}: {
  setPlayerData: React.Dispatch<React.SetStateAction<(Player | undefined)[]>>;
  setIsSorting: React.Dispatch<React.SetStateAction<boolean>>;
  isSorting: boolean;
  handleSort: () => void;
  isSortPending: boolean;
}) {
  const [open, setOpen] = useState(false);

  const [openMultiple, setOpenMultiple] = useState(false);

  return (
    <>
      <div className="max-sm:grid max-sm:gap-2 sm:space-x-2">
        <Button onClick={() => setOpen(true)}>Add Player</Button>
        <Button onClick={() => setOpenMultiple(true)}>
          Add Multiple Players
        </Button>
        <Button
          variant={"outline"}
          onClick={() => {
            if (isSorting) handleSort();
            else setIsSorting((prev) => !prev);
          }}
          className={cn("min-w-32", {
            "border-green-600 bg-green-600 text-green-50 hover:bg-green-500 hover:text-gray-50":
              isSorting,
          })}
          disabled={isSortPending}
        >
          {isSortPending && <Loader2 className="mr-2 size-3 animate-spin" />}
          {isSorting ? "Done Sorting" : "Sort Players"}
        </Button>
      </div>
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
    </>
  );
}

export default AddPlayerButton;
