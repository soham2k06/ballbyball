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
import { useAllPlayers } from "@/apiHooks/player";
import Link from "next/link";

function AddPlayerButton() {
  const [open, setOpen] = useState(false);

  const [showCreateTeam, setShowCreateTeam] = useState(false);

  const { players } = useAllPlayers();

  // TODO: Create two teams with auto spreading players on two teams

  return (
    <>
      <Button
        disabled={!players}
        onClick={() => {
          if (!players?.length) setShowCreateTeam(true);
          else setOpen(true);
        }}
      >
        Add
      </Button>

      <CreateTeamDialog open={open} setOpen={setOpen} />

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
