import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  CreateMatchSchema,
  UpdateMatchSchema,
  createMatchSchema,
} from "@/lib/validation/match";
import { OverlayStateProps, TeamWithPlayers } from "@/types";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { useActionMutate, useValidateMatchData } from "@/lib/hooks";
import PlayerLabel from "../players-selection/PlayerLabel";
import { createMatch, updateMatch } from "@/lib/actions/match";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface StartUpdateMatchDialogProps extends OverlayStateProps {
  matchToUpdate?: UpdateMatchSchema & { teams: { id: string }[] };
  teams: TeamWithPlayers[];
}

function StartUpdateMatchDialog({
  open,
  setOpen,
  matchToUpdate,
  teams,
}: StartUpdateMatchDialogProps) {
  const form = useForm<CreateMatchSchema | UpdateMatchSchema>({
    resolver: zodResolver(createMatchSchema),
    defaultValues: {
      name: "",
      teamIds: [],
      overs: 0,
    },
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { isDirty },
  } = form;

  const { mutate: createMutate, isPending: isCreating } =
    useActionMutate(createMatch);
  const { mutate: updateMutate, isPending: isUpdating } =
    useActionMutate(updateMatch);

  const watchedTeamIds = form.watch("teamIds") || [];
  const selectedTeams = watchedTeamIds.map((id) =>
    teams.find((team) => team.id === id),
  );

  const { containsSamePlayer, isDifferentPlayerLengthTeams } =
    useValidateMatchData((watchedTeamIds ?? []) || []);

  const isPending = isCreating || isUpdating;

  async function onSubmit(data: CreateMatchSchema | UpdateMatchSchema) {
    if (matchToUpdate) {
      updateMutate(
        { ...data, id: matchToUpdate.id },
        {
          onSuccess: () => {
            reset();
            setOpen(false);
          },
        },
      );

      return;
    }
    createMutate(data as CreateMatchSchema, {
      onSuccess: () => {
        reset();
        setOpen(false);
      },
    });
  }

  useEffect(() => {
    if (open && matchToUpdate) {
      reset(matchToUpdate);
    }
  }, [open, matchToUpdate]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="rounded-md p-0">
        <DialogHeader>
          <DialogTitle>{matchToUpdate ? "Update" : "Start"} Match</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Match Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Match name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="teamIds"
              render={() => (
                <FormItem>
                  <FormLabel>Teams</FormLabel>
                  <ul className="grid max-h-96 grid-cols-2 gap-2 overflow-auto">
                    {teams?.map((item) => (
                      <FormField
                        key={item.id}
                        control={control}
                        name="teamIds"
                        render={({ field }) => {
                          const isSelected = field.value?.includes(item.id);

                          return (
                            <FormItem key={item.id} className="space-y-0">
                              <FormControl>
                                <Checkbox
                                  className="sr-only"
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...(field.value ?? []),
                                          item.id,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="curTeam"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Batting First Team</FormLabel>
                  <FormControl>
                    <Select
                      defaultValue={
                        matchToUpdate ? String(matchToUpdate?.curTeam) : ""
                      }
                      onValueChange={(val) => {
                        field.onChange(val ? parseInt(val) : 0);
                      }}
                      disabled={!(watchedTeamIds ?? []).length}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select the team that'll bat first" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectedTeams.map((team, i) => (
                          <SelectItem value={String(i)}>
                            {team?.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="overs"
              rules={{
                min: { value: 1, message: "Enter Mininum 1 over" },
                max: { value: 50, message: "Enter Maximum 50 overs" },
              }}
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Overs</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Match Overs"
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="allowSinglePlayer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <p>Allow single player</p>
                      <FormDescription>
                        It will not be declared all out if only one player is
                        left
                      </FormDescription>
                    </div>
                  </FormLabel>
                </FormItem>
              )}
            />

            <DialogDescription>
              {(form.watch("teamIds")?.length ?? 0) >= 2 && (
                <>
                  {containsSamePlayer && (
                    <p className="text-sm text-destructive">
                      Both teams should not have same player, it may lead to
                      bugs.
                    </p>
                  )}
                  {isDifferentPlayerLengthTeams && (
                    <p className="text-sm text-destructive">
                      Both teams should have same number of players, please look
                      into it.
                    </p>
                  )}
                </>
              )}
            </DialogDescription>

            <DialogFooter>
              <LoadingButton
                type="submit"
                disabled={isPending || !isDirty}
                loading={isPending}
              >
                {isPending
                  ? !!matchToUpdate
                    ? "Updating..."
                    : "Adding..."
                  : !!matchToUpdate
                    ? "Update"
                    : "Add"}
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default StartUpdateMatchDialog;
