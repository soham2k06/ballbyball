import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
import { Control, useForm } from "react-hook-form";

import { createMatch, updateMatch } from "@/lib/actions/match";
import { useActionMutate, useValidateMatchData } from "@/lib/hooks";
import { cn, abbreviateEntity } from "@/lib/utils";
import {
  CreateMatchSchema,
  UpdateMatchSchema,
  createMatchSchema,
} from "@/lib/validation/match";
import { OverlayStateProps, TeamWithPlayers } from "@/types";

import { Button } from "@/components/ui/button";
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
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
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

interface StartUpdateMatchDialogProps extends OverlayStateProps {
  matchToUpdate?: UpdateMatchSchema & {
    teams: { id: string; batFirst?: boolean }[];
  };
  teams: TeamWithPlayers[];
  isTeamsFetching: boolean;
}

function TeamField({
  item,
  control,
}: {
  item: TeamWithPlayers;
  control: Control<CreateMatchSchema | UpdateMatchSchema>;
}) {
  return (
    <FormField
      key={item.id}
      control={control}
      name="teamIds"
      render={({ field }) => {
        const isSelected = field.value?.includes(item.id);
        const disabled = (field.value ?? "").length >= 2 && !isSelected;

        return (
          <FormItem key={item.id} className="flex space-y-0">
            <FormControl>
              <Checkbox
                disabled={disabled}
                className="sr-only"
                checked={field.value?.includes(item.id)}
                onCheckedChange={(checked) => {
                  return checked
                    ? field.onChange([...(field.value ?? []), item.id])
                    : field.onChange(
                        field.value?.filter((value) => value !== item.id),
                      );
                }}
              />
            </FormControl>

            <FormLabel
              className={cn(
                "inline-flex h-8 w-full cursor-pointer items-center truncate rounded bg-muted p-1 text-sm font-normal",
                {
                  "bg-emerald-500 font-black text-emerald-950": isSelected,
                  "opacity-25": disabled,
                },
              )}
              aria-disabled={disabled}
            >
              {item.name}
            </FormLabel>
          </FormItem>
        );
      }}
    />
  );
}

function StartUpdateMatchDialog({
  open,
  setOpen,
  matchToUpdate,
  teams,
  isTeamsFetching,
}: StartUpdateMatchDialogProps) {
  const router = useRouter();
  const [isMatchNameModified, setIsMatchNameModified] = useState(false);

  const form = useForm<CreateMatchSchema | UpdateMatchSchema>({
    resolver: zodResolver(createMatchSchema),
    defaultValues: {
      name: "",
      teamIds: [],
      overs: 0,
      allowSinglePlayer: true,
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
  const selectedTeams = watchedTeamIds
    .map((id) => teams.find((team) => team.id === id))
    .filter((t) => t !== undefined);
  const defBatFirstTeam = matchToUpdate
    ? teams.find((team) =>
        matchToUpdate?.teams.some((t) => t.batFirst && t.id === team.id),
      )
    : null;

  const { containsSamePlayer, isDifferentPlayerLengthTeams } =
    useValidateMatchData(selectedTeams ?? []);

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
    } else {
      createMutate(data as CreateMatchSchema, {
        onSuccess: (newMatchId) => {
          reset();
          setOpen(false);
          router.push(`/match/${newMatchId}`);
        },
      });
    }
  }

  useEffect(() => {
    if (open && matchToUpdate) {
      matchToUpdate.batFirst = defBatFirstTeam?.id;
      reset(matchToUpdate);
    }
  }, [open, matchToUpdate, defBatFirstTeam?.id, reset]);

  useEffect(() => {
    const numTeams = (form.watch("teamIds") || []).length;
    if (!isMatchNameModified && !form.watch("name") && numTeams === 2) {
      const formattedTime = Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "numeric",
        hour12: true,
      })
        .format(new Date())
        .replace(/\s[AP]M/, "");

      const matchName = `${selectedTeams
        .map((team) => (team.name ? abbreviateEntity(team.name) : ""))
        .join(" vs ")} (${formattedTime})`;

      form.resetField("name", { defaultValue: matchName });
    }
  }, [form, selectedTeams, isMatchNameModified]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-y-auto rounded-md">
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
                    <Input
                      placeholder="Match name"
                      {...field}
                      onChange={(e) => {
                        setIsMatchNameModified(true);
                        field.onChange(e);
                      }}
                    />
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
                  {!isTeamsFetching ? (
                    <ul className="grid grid-cols-3 gap-2">
                      {teams.slice(0, 5).map((item) => (
                        <TeamField
                          key={item.id}
                          item={item}
                          control={control}
                        />
                      ))}
                      <Drawer>
                        <DrawerTrigger asChild>
                          <Button size="sm" variant="outline" className="gap-1">
                            All teams{" "}
                            <ArrowRight className="size-4" strokeWidth={1.5} />
                          </Button>
                        </DrawerTrigger>
                        <DrawerContent>
                          <DrawerHeader>
                            <DrawerTitle>
                              All Teams ({teams.length})
                            </DrawerTitle>
                          </DrawerHeader>
                          <ul className="grid max-h-96 grid-cols-3 gap-2 overflow-y-auto p-4">
                            {teams.map((item) => (
                              <TeamField
                                key={item.id}
                                item={item}
                                control={control}
                              />
                            ))}
                          </ul>
                        </DrawerContent>
                      </Drawer>
                    </ul>
                  ) : (
                    <div className="flex items-center gap-1 rounded-md bg-muted p-4">
                      <p className="text-xs">Loading teams</p>
                      <Loader2 className="size-3 animate-spin" />
                    </div>
                  )}

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="batFirst"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Batting First Team</FormLabel>
                  <FormControl>
                    <Select
                      onChange={field.onChange}
                      value={field.value}
                      disabled={
                        !(watchedTeamIds ?? []).length || field.disabled
                      }
                      placeholder="Select the team that'll bat first"
                    >
                      {[
                        {
                          id: "",
                          name: "Select the team that'll bat first",
                        },
                        ...selectedTeams,
                      ].map((team) => (
                        <option value={team.id} key={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="overs"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel>Overs</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Match Overs"
                        type="number"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(parseInt(value.replace(/^0+/, "")));
                        }}
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

            {(form.watch("teamIds")?.length ?? 0) >= 2 && (
              <>
                {containsSamePlayer && (
                  <DialogDescription className=" text-destructive">
                    Both teams should not have same player, it may lead to bugs.
                  </DialogDescription>
                )}
                {isDifferentPlayerLengthTeams && (
                  <DialogDescription className="text-destructive">
                    Both teams should have same number of players, please look
                    into it.
                  </DialogDescription>
                )}
              </>
            )}

            <DialogFooter className="sticky bottom-0">
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
