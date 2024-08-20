import { MatchExtended, PlayerPerformance } from "@/types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { Button } from "../ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Player } from "@prisma/client";

interface PlayerCardsDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  match: MatchExtended | undefined;
  playersPerformance: PlayerPerformance[];
}

function PlayerCardsDialog({
  open,
  setOpen,
  match,
  playersPerformance,
}: PlayerCardsDialogProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const selectedPlayerPerformance = playersPerformance.find(
    (player) => player.playerId === selectedPlayer?.id,
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent>
        <SheetHeader className="mb-4">
          <SheetTitle>Player cards</SheetTitle>
          <SheetDescription>
            Select a player to view their card
          </SheetDescription>
        </SheetHeader>
        <ul className="flex gap-6">
          {match?.teams.map((team) => (
            <div key={team.name} className="w-full">
              <h4 className="mb-2 text-center text-lg font-semibold">
                {team.name}
              </h4>
              <ul className="space-y-2">
                {team.players.map((player) => (
                  <li key={player.id}>
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => setSelectedPlayer(player)}
                    >
                      {player.name}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </ul>
      </SheetContent>
      <Dialog
        open={!!selectedPlayer}
        onOpenChange={(open) => {
          if (!open) setSelectedPlayer(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedPlayer?.name}</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
}

export default PlayerCardsDialog;
