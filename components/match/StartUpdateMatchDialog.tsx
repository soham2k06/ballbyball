import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { OverlayStateProps } from "@/types";
import {
  CreateMatchSchema,
  UpdateMatchSchema,
  createMatchSchema,
} from "@/lib/validation/match";
import { useAllTeams } from "@/apiHooks/team";
import { useCreateMatch, useUpdateMatch } from "@/apiHooks/match";

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
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect, useState } from "react";
import { useValidateMatchData } from "@/lib/hooks";

interface StartUpdateMatchDialogProps extends OverlayStateProps {
  matchToUpdate?: UpdateMatchSchema & { teams: { id: string }[] };
}

function StartUpdateMatchDialog({
  open,
  setOpen,
  matchToUpdate,
}: StartUpdateMatchDialogProps) {
  const form = useForm<CreateMatchSchema | UpdateMatchSchema>({
    resolver: zodResolver(createMatchSchema),
    defaultValues: {
      name: "",
      teamIds: [],
      overs: 0,
    },
  });

  const { allTeams: teams } = useAllTeams();

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { isDirty },
  } = form;

  const [isOversDirty, setIsOversDirty] = useState(false);

  const { createMatch, isPending: isCreating } = useCreateMatch();
  const { updateMatch, isPending: isUpdating } = useUpdateMatch();

  const { containsSamePlayer, isDifferentPlayerLengthTeams } =
    useValidateMatchData(form.watch("teamIds") || []);

  const isPending = isCreating || isUpdating;

  async function onSubmit(data: CreateMatchSchema | UpdateMatchSchema) {
    // TODO: Create Input for curTeam

    if (matchToUpdate) {
      updateMatch(
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
    createMatch(
      {
        curTeam: 0,
        ...(data as CreateMatchSchema),
      },
      {
        onSuccess: () => {
          reset();
          setOpen(false);
        },
      },
    );
  }

  useEffect(() => {
    if (open && matchToUpdate) reset(matchToUpdate);
  }, [open, matchToUpdate]);

  useEffect(() => {
    if (matchToUpdate)
      setIsOversDirty(form.watch("overs") !== matchToUpdate?.overs);
  }, [form.watch("overs")]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="rounded-md p-0">
        <DialogHeader className="p-4">
          <DialogTitle>{matchToUpdate ? "Update" : "Add"} Team</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="max-h-full space-y-3 overflow-y-auto p-4"
          >
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

            {!matchToUpdate && (
              <FormField
                control={form.control}
                name="teamIds"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Teams</FormLabel>
                      <FormDescription>
                        First team selected will be batting first
                      </FormDescription>
                    </div>
                    {teams?.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="teamIds"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...field.value!,
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
                              <FormLabel className="font-normal">
                                {item.name}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="overs"
              rules={{
                min: { value: 1, message: "Enter Mininum 1 over" },
                max: { value: 50, message: "Enter Maximum 50 overs" },
              }}
              render={({ field }) => {
                const { onChange, ...rest } = field;
                return (
                  <FormItem>
                    <FormLabel>Overs</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Match Overs"
                        type="number"
                        onChange={(e) =>
                          setValue("overs", parseInt(e.target.value))
                        }
                        {...rest}
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
                      Allow single player
                      <FormDescription>
                        It will not be declared all out if only one player is
                        left
                      </FormDescription>
                    </div>
                  </FormLabel>
                </FormItem>
              )}
            />

            <DialogFooter>
              <LoadingButton
                type="submit"
                disabled={isPending || (!isDirty && !isOversDirty)}
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

        {(form.watch("teamIds")?.length ?? 0) >= 2 && (
          <>
            {containsSamePlayer &&
              "Both teams can't have same player, please look into it."}
            {isDifferentPlayerLengthTeams &&
              "Both teams should have same number of players, please look into it."}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default StartUpdateMatchDialog;
