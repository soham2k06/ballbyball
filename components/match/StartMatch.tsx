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

import StartMatchDialog from "./StartUpdateMatchDialog";
import Link from "next/link";
import { TeamWithPlayers } from "@/types";

function StartMatchButton({ teams }: { teams: TeamWithPlayers[] }) {
  const [open, setOpen] = useState(false);

  const [showCreateTeam, setShowCreateTeam] = useState(false);

  return (
    <>
      <Button
        disabled={!teams}
        onClick={() => {
          if ((teams?.length ?? 0) < 2) setShowCreateTeam(true);
          else setOpen(true);
        }}
        className="max-sm:w-full"
      >
        Start match
      </Button>

      <StartMatchDialog open={open} setOpen={setOpen} teams={teams} />

      <Dialog open={showCreateTeam} onOpenChange={setShowCreateTeam}>
        <DialogContent>
          <DialogHeader className="mb-4">
            <DialogTitle>Add teams first</DialogTitle>
            <DialogDescription>
              To start a match, you'll need to create a team first.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCreateTeam(false)}>
              Close
            </Button>
            <Button asChild>
              <Link href="/teams">Create team</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default StartMatchButton;
