"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { Player } from "@prisma/client";
import { Loader2, Plus } from "lucide-react";

import { createPlayer, getAllPlayers } from "@/lib/actions/player";
import { updateTeam } from "@/lib/actions/team";
import { useActionMutate } from "@/lib/hooks";
import { TeamWithPlayers } from "@/types";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface UpdateTeamPlayersDialogProps {
  open: boolean;
  // eslint-disable-next-line no-unused-vars
  setOpen: (open: boolean) => void;
  team: TeamWithPlayers & { captain?: string | null };
}

function UpdateTeamPlayersDialog({
  open,
  setOpen,
  team,
}: UpdateTeamPlayersDialogProps) {
  const router = useRouter();

  const [allPlayers, setAllPlayers] = useState<Pick<Player, "id" | "name">[]>(
    [],
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
  const [isCreatingPlayer, setIsCreatingPlayer] = useState(false);

  const { mutate: updateTeamMutate, isPending: isSaving } =
    useActionMutate(updateTeam);

  useEffect(() => {
    if (!open) return;
    setSelectedIds(team.players.map((p) => p.id));
    setNewPlayerName("");
    setIsLoadingPlayers(true);
    getAllPlayers().then((players) => {
      setAllPlayers(players ?? []);
      setIsLoadingPlayers(false);
    });
  }, [open, team]);

  function togglePlayer(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }

  async function handleCreatePlayer() {
    const name = newPlayerName.trim();
    if (!name) return;
    setIsCreatingPlayer(true);
    try {
      const created = await createPlayer({ name }, { revalidate: false });
      if (created) {
        setAllPlayers((prev) => [...prev, created]);
        setSelectedIds((prev) => [...prev, created.id]);
      }
      setNewPlayerName("");
    } finally {
      setIsCreatingPlayer(false);
    }
  }

  function handleSave() {
    updateTeamMutate(
      {
        id: team.id,
        name: team.name,
        playerIds: selectedIds,
        captain: team.captain ?? null,
      },
      {
        onSuccess: () => {
          setOpen(false);
          router.refresh();
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex max-h-[90dvh] flex-col gap-4">
        <DialogHeader>
          <DialogTitle>Update Players — {team.name}</DialogTitle>
        </DialogHeader>

        {isLoadingPlayers ? (
          <ul className="flex-1 space-y-1 overflow-y-auto">
            {Array.from({ length: 12 }, (_, i) => (
              <li key={i}>
                <Skeleton className="h-9 w-full rounded" />
              </li>
            ))}
          </ul>
        ) : (
          <ul className="flex-1 space-y-1 overflow-y-auto">
            {allPlayers.map((player) => {
              const checked = selectedIds.includes(player.id);
              return (
                <li key={player.id}>
                  <Label
                    className={`flex cursor-pointer items-center gap-3 rounded p-2 text-sm ${
                      checked
                        ? "bg-emerald-500 font-bold text-emerald-950"
                        : "bg-muted"
                    }`}
                  >
                    <Checkbox
                      className="sr-only"
                      checked={checked}
                      onCheckedChange={() => togglePlayer(player.id)}
                    />
                    {player.name}
                  </Label>
                </li>
              );
            })}
          </ul>
        )}

        <Separator />

        <Label htmlFor="new-player">Adding a new player?</Label>
        <div className="flex gap-2">
          <Input
            id="new-player"
            placeholder="New player name"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreatePlayer()}
            className="h-8 text-sm"
          />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="h-8 gap-1"
            disabled={!newPlayerName.trim() || isCreatingPlayer}
            onClick={handleCreatePlayer}
          >
            {isCreatingPlayer ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Plus size={14} />
            )}
            Add
          </Button>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSave}
            disabled={isSaving || selectedIds.length === 0}
            className="w-full"
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default UpdateTeamPlayersDialog;
