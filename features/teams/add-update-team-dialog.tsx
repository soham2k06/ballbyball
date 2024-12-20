import { FormEvent, useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { usePlayers } from "@/api-hooks/use-players";
import { createTeam, updateTeam } from "@/lib/actions/team";
import { useActionMutate } from "@/lib/hooks";
import {
  CreateTeamSchema,
  UpdateTeamSchema,
  createTeamSchema,
} from "@/lib/validation/team";
import { OverlayStateProps } from "@/types";

import PlayerLabel from "@/features/match/players-selection/player-label";

import AlertNote from "@/components/alert-note";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import LoadingButton from "@/components/ui/loading-button";
import { Select } from "@/components/ui/select";

interface AddUpdateTeamDialogProps extends OverlayStateProps {
  teamToUpdate?: UpdateTeamSchema & { matchId: string | null };
}

function AddUpdateTeamDialog({
  open,
  setOpen,
  teamToUpdate,
}: AddUpdateTeamDialogProps) {
  const { players, isLoading } = usePlayers();

  const form = useForm<CreateTeamSchema>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: "",
      playerIds: [],
      captain: "",
    },
  });

  const {
    handleSubmit,
    control,
    watch,
    reset,
    formState: { isDirty, dirtyFields },
  } = form;

  const [showAlert, setShowAlert] = useState<boolean>(false);

  const { mutate: createMutate, isPending: isCreating } =
    useActionMutate(createTeam);
  const { mutate: updateMutate, isPending: isUpdating } =
    useActionMutate(updateTeam);

  const isPending = isCreating || isUpdating;

  const watchedPlayerIds = watch("playerIds");
  const selectedPlayers = players?.filter(({ id }) =>
    watchedPlayerIds.includes(id),
  );

  function onSubmit(data: CreateTeamSchema) {
    if (teamToUpdate) {
      updateMutate(
        { id: teamToUpdate.id, ...data },
        {
          onSuccess: () => {
            reset();
            setOpen(false);
          },
        },
      );
      return;
    }
    createMutate(data, {
      onSuccess: () => {
        reset();
        setOpen(false);
      },
    });
  }

  function handleSubmitOwn(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (teamToUpdate && dirtyFields.playerIds && teamToUpdate.matchId) {
      setShowAlert(true);
      return;
    }

    handleSubmit(onSubmit)();
  }

  useEffect(() => {
    if (open && teamToUpdate) reset(teamToUpdate);
  }, [open, reset, teamToUpdate]);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[95%] rounded-md">
          <DialogHeader>
            <DialogTitle>{teamToUpdate ? "Update" : "Add"} Team</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={handleSubmitOwn}
              className="space-y-3 overflow-y-auto p-1"
            >
              <FormField
                control={control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Team name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="playerIds"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Players</FormLabel>
                      <FormDescription>
                        Select the players from your collection
                      </FormDescription>
                    </div>
                    {!isLoading ? (
                      players?.length ? (
                        <ul className="grid max-h-40 grid-cols-2 gap-2 overflow-auto">
                          {players.map((player) => (
                            <FormField
                              key={player.id}
                              control={control}
                              name="playerIds"
                              render={({ field }) => {
                                const isSelected = field.value.includes(
                                  player.id,
                                );

                                return (
                                  <FormItem
                                    key={player.id}
                                    className="space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        className="sr-only"
                                        checked={field.value.includes(
                                          player.id,
                                        )}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([
                                                ...field.value,
                                                player.id,
                                              ])
                                            : field.onChange(
                                                field.value.filter(
                                                  (value) =>
                                                    value !== player.id,
                                                ),
                                              );
                                        }}
                                      />
                                    </FormControl>

                                    <PlayerLabel
                                      title={player.name}
                                      isSelected={isSelected}
                                    />
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </ul>
                      ) : (
                        <p>No players</p>
                      )
                    ) : (
                      Array.from({ length: 8 }).map((_, i) => (
                        <PlayerLabel
                          key={i}
                          title="Loading..."
                          isOpacityDown
                          isBrightnessDown
                        />
                      ))
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="captain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Captain (Optional)</FormLabel>

                    <Select
                      defaultValue={teamToUpdate?.captain ?? ""}
                      onChange={field.onChange}
                      disabled={!selectedPlayers?.length}
                    >
                      {selectedPlayers.map(({ id, name }) => (
                        <option key={id} value={id}>
                          {name}
                        </option>
                      ))}
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <LoadingButton
                  type="submit"
                  disabled={isPending || !isDirty}
                  loading={isPending}
                >
                  {isPending
                    ? !!teamToUpdate
                      ? "Updating..."
                      : "Adding..."
                    : !!teamToUpdate
                      ? "Update"
                      : "Add"}
                </LoadingButton>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <AlertNote
        open={showAlert}
        setOpen={setShowAlert}
        onConfirm={() => {
          setShowAlert(false);
          handleSubmit(onSubmit)();
        }}
        content="We've noticed that you've changed the players. Replacing or removing existing players may lead to bugs if the match is still ongoing."
      />
    </>
  );
}

export default AddUpdateTeamDialog;
