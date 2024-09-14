import { Player } from "@prisma/client";

import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { TypographyH3 } from "@/components/ui/typography";

interface TeamPlayersProps {
  showingTeam:
    | { players: Player[]; captainId: string | null; name: string }
    | undefined;
  onClose: () => void;
}

function TeamPlayers({ showingTeam, onClose }: TeamPlayersProps) {
  const { players, captainId, name } = showingTeam ?? {};
  const captainIndex =
    players && players.findIndex((player) => player.id === captainId);

  return (
    <Dialog open={!!showingTeam} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader className="w-fit border-b p-4 pt-0">
          <TypographyH3>{name}</TypographyH3>
        </DialogHeader>
        <ul className="max-h-96 overflow-auto">
          {players?.map((player) => (
            <li key={player.id}>
              <p className="text-lg font-semibold leading-10">
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
