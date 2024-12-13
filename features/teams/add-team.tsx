"use client";

import { useState } from "react";

import Link from "next/link";

import { usePlayers } from "@/api-hooks/use-players";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import CreateTeamDialog from "./add-update-team-dialog";

function AddTeamButton() {
  const { players = [], isLoading } = usePlayers();

  const [open, setOpen] = useState(false);

  const [showCreatePlayer, setShowCreatePlayer] = useState(false);

  return (
    <>
      <Button
        onClick={() => {
          if (!players.length) setShowCreatePlayer(true);
          else setOpen(true);
        }}
        disabled={isLoading}
      >
        Add single
      </Button>

      <CreateTeamDialog open={open} setOpen={setOpen} />

      <Dialog open={showCreatePlayer} onOpenChange={setShowCreatePlayer}>
        <DialogContent>
          <DialogHeader className="mb-4">
            <DialogTitle>Add players first</DialogTitle>
            <DialogDescription>
              To add a team, you&apos;ll need to add players first.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCreatePlayer(false)}>
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

export default AddTeamButton;
