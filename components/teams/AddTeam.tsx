"use client";

import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import CreateTeamDialog from "./AddUpdateTeamDialog";
import Link from "next/link";
import { Player } from "@prisma/client";

function AddPlayerButton({ players }: { players: Player[] }) {
  const [open, setOpen] = useState(false);

  const [showCreateTeam, setShowCreateTeam] = useState(false);

  return (
    <>
      <Button
        onClick={() => {
          if (!players?.length) setShowCreateTeam(true);
          else setOpen(true);
        }}
      >
        Add single
      </Button>

      <CreateTeamDialog open={open} setOpen={setOpen} players={players} />

      <Dialog open={showCreateTeam} onOpenChange={setShowCreateTeam}>
        <DialogContent>
          <DialogHeader className="mb-4">
            <DialogTitle>Add players first</DialogTitle>
            <DialogDescription>
              To add a team, you'll need to add players first.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCreateTeam(false)}>
              Close
            </Button>
            <Button asChild>
              <Link href="/players">Add players</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AddPlayerButton;
