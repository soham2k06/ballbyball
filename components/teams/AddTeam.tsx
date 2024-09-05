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
import { getAllPlayers } from "@/lib/actions/player";
import { useQuery } from "@tanstack/react-query";

function AddPlayerButton() {
  const { data: players = [] } = useQuery({
    queryKey: ["players"],
    queryFn: () => getAllPlayers(),
  });

  const [open, setOpen] = useState(false);

  const [showCreatePlayer, setShowCreatePlayer] = useState(false);

  return (
    <>
      <Button
        onClick={() => {
          if (!players.length) setShowCreatePlayer(true);
          else setOpen(true);
        }}
      >
        Add single
      </Button>

      <CreateTeamDialog open={open} setOpen={setOpen} />

      <Dialog open={showCreatePlayer} onOpenChange={setShowCreatePlayer}>
        <DialogContent>
          <DialogHeader className="mb-4">
            <DialogTitle>Add players first</DialogTitle>
            <DialogDescription>
              To add a team, you'll need to add players first.
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

export default AddPlayerButton;
