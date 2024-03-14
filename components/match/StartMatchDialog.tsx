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
import { OverlayStateProps } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Checkbox } from "../ui/checkbox";
import { useAllTeams } from "@/hooks/api/team/useAllTeams";
import { CreateMatchSchema, createMatchSchema } from "@/lib/validation/match";
import { useCreateMatch } from "@/hooks/api/match/useCreateMatch";
import { usePlayersByIds } from "@/hooks/api/player/usePlayersByIds";

function StartMatchDialog({ open, setOpen }: OverlayStateProps) {
  const form = useForm<CreateMatchSchema>({
    resolver: zodResolver(createMatchSchema),
    defaultValues: {
      name: "",
      teamIds: [],
      overs: 0,
    },
  });

  const { allTeams: teams } = useAllTeams();
  const { players } = usePlayersByIds(teams?.map((team) => team.playerIds)!);

  const { handleSubmit, control, reset, setValue } = form;
  const { createMatch, isPending } = useCreateMatch();

  async function onSubmit(data: CreateMatchSchema) {
    // TODO: Create Input for curTeam
    createMatch(
      {
        ...data,
        curTeam: 0,
        allPlayers: players?.flat()?.map((player) => ({
          id: player.id,
          teamId: "65ec4c46240deefca7573ec0",
          batEvents: [],
          bowlEvents: [],
        }))!,
      },
      {
        onSuccess: () => {
          reset();
          setOpen(false);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="h-full rounded-md p-0">
        <DialogHeader className="p-4">
          <DialogTitle>Add Team</DialogTitle>
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
                  <div className="mb-4">
                    <FormLabel className="text-base">Teams</FormLabel>
                    <FormDescription>
                      Select the temas from your collection
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
                                    ? field.onChange([...field.value, item.id])
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
                          setValue(
                            "overs",
                            parseInt(e.target.value as unknown as string),
                          )
                        }
                        {...rest}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <DialogFooter>
              <LoadingButton
                type="submit"
                disabled={isPending}
                loading={isPending}
              >
                {isPending ? "Adding..." : "Add"}
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default StartMatchDialog;
