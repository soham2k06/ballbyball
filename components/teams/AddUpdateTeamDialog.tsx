import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  CreateTeamSchema,
  UpdateTeamSchema,
  createTeamSchema,
} from "@/lib/validation/team";
import { OverlayStateProps, PlayerSimplified } from "@/types";

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
import { FormEvent, useEffect, useState } from "react";
import AlertNote from "../AlertNote";
import PlayerLabel from "../players-selection/PlayerLabel";
import { Checkbox } from "../ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useActionMutate } from "@/lib/hooks";
import { createTeam, updateTeam } from "@/lib/actions/team";

interface AddUpdateTeamDialogProps extends OverlayStateProps {
  players: PlayerSimplified[];
  teamToUpdate?: UpdateTeamSchema & { matchId: string | null };
}

function AddUpdateTeamDialog({
  open,
  setOpen,
  teamToUpdate,
  players,
}: AddUpdateTeamDialogProps) {
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
  }, [open, teamToUpdate]);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[95%] rounded-md">
          <DialogHeader >
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
                    {players?.length ? (
                      <ul className="grid max-h-40 grid-cols-2 gap-2 overflow-auto">
                        {players?.map((item) => (
                          <FormField
                            key={item.id}
                            control={control}
                            name="playerIds"
                            render={({ field }) => {
                              const isSelected = field.value.includes(item.id);

                              return (
                                <FormItem key={item.id} className="space-y-0">
                                  <FormControl>
                                    <Checkbox
                                      className="sr-only"
                                      checked={field.value.includes(item.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([
                                              ...field.value,
                                              item.id,
                                            ])
                                          : field.onChange(
                                              field.value.filter(
                                                (value) => value !== item.id,
                                              ),
                                            );
                                      }}
                                    />
                                  </FormControl>

                                  <PlayerLabel
                                    title={item.name}
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
                      onValueChange={field.onChange}
                      disabled={!selectedPlayers?.length}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select the captain of your team" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectedPlayers?.length ? (
                          selectedPlayers?.map(({ id, name }) => (
                            <SelectItem value={id}>{name}</SelectItem>
                          ))
                        ) : (
                          <SelectItem value="disabled" disabled>
                            Select players to choose a captain
                          </SelectItem>
                        )}
                      </SelectContent>
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
