"use client";

import { useState } from "react";

import Link from "next/link";

import { addAnalytics } from "@/lib/actions/app-analytics";
import { TeamWithPlayers } from "@/types";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import StartMatchDialog from "./start-update-dialog";

function StartMatchButton({
  teams,
  isLoading,
  isFetching,
}: {
  teams: TeamWithPlayers[];
  isLoading: boolean;
  isFetching: boolean;
}) {
  const [open, setOpen] = useState(false);

  const [showCreateTeam, setShowCreateTeam] = useState(false);

  function handleStartButtonClick() {
    addAnalytics({
      event: "click",
      property: "btn-start_match_open",
      module: "matches",
    });
    if (teams.length < 2) setShowCreateTeam(true);
    else setOpen(true);
  }

  return (
    <>
      <Button
        onClick={handleStartButtonClick}
        disabled={isLoading}
        className="max-sm:w-full"
      >
        Start match
      </Button>

      <StartMatchDialog
        open={open}
        setOpen={setOpen}
        teams={teams}
        isTeamsFetching={isFetching}
      />

      <Dialog open={showCreateTeam} onOpenChange={setShowCreateTeam}>
        <DialogContent>
          <DialogHeader className="mb-4">
            <DialogTitle>Add teams first</DialogTitle>
            <DialogDescription>
              To start a match, you&apos;ll need to create a team first.
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
