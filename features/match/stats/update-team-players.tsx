"use client";

import { useEffect, useState } from "react";

import { Loader2, Plus } from "lucide-react";

import { useCreatePlayer, usePlayers, useUpdateTeam } from "@/lib/hooks";
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
  const { players: cachedPlayers, isLoading } = usePlayers();
  const { mutateAsync: createPlayerAsync, isPending: isCreatingPlayer } =
    useCreatePlayer();
  const { mutate: updateTeamMutate, isPending: isSaving } = useUpdateTeam();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [extraPlayers, setExtraPlayers] = useState<
    { id: string; name: string }[]
  >([]);

  const allPlayers = [
    ...cachedPlayers,
    ...extraPlayers.filter((p) => !cachedPlayers.find((cp) => cp.id === p.id)),
  ];

  useEffect(() => {
    if (!open) return;
    setSelectedIds(team.players.map((p) => p.id));
    setNewPlayerName("");
    setExtraPlayers([]);
  }, [open, team]);

  function togglePlayer(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }

  async function handleCreatePlayer() {
    const name = newPlayerName.trim();
    if (!name) return;
    try {
      const created = await createPlayerAsync({ name });
      setExtraPlayers((prev) => [...prev, created]);
      setSelectedIds((prev) => [...prev, created.id]);
      setNewPlayerName("");
    } catch {
      // error surfaced by mutation
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
        onSuccess: () => setOpen(false),
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex max-h-[90dvh] flex-col gap-4">
        <DialogHeader>
          <DialogTitle>Update Players — {team.name}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
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
