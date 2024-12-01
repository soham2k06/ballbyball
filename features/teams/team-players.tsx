import { Player } from "@prisma/client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TeamPlayersProps {
  showingTeam:
    | { players: Player[]; captainId: string | null; name: string }
    | undefined;
  onClose: () => void;
  open: boolean;
}

function TeamPlayers({ showingTeam, onClose, open }: TeamPlayersProps) {
  const { players = [], captainId, name } = showingTeam ?? {};
  const captainIndex =
    players && players.findIndex((player) => player.id === captainId);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader className="border-b pb-4">
          <DialogTitle>{name}</DialogTitle>
          <DialogDescription>{players.length} players</DialogDescription>
        </DialogHeader>
        <ul className="max-h-96 overflow-auto text-lg font-medium">
          {players.map((player) => (
            <li key={player.id}>
              <p className="leading-10">
                {player.name}{" "}
                {captainIndex === players.indexOf(player) && "(C)"}
              </p>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

export default TeamPlayers;
