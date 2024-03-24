import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { OverlayStateProps } from "@/types";
import { CreateTeamSchema, createTeamSchema } from "@/lib/validation/team";
import { useAllPlayers } from "@/apiHooks/player";
import { useCreateTeam } from "@/apiHooks/team";

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
import { Checkbox } from "../ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

function AddTeamFormDialog({ open, setOpen }: OverlayStateProps) {
  const form = useForm<CreateTeamSchema>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: "",
      playerIds: [],
      captain: "",
    },
  });

  const { handleSubmit, control, watch, reset } = form;
  const { createTeam, isPending } = useCreateTeam();

  const { players } = useAllPlayers();

  const watchedPlayerIds = watch("playerIds");
  const selectedPlayers = players?.filter(({ id }) =>
    watchedPlayerIds.includes(id),
  );

  function onSubmit(data: CreateTeamSchema) {
    console.log(data);
    createTeam(data, {
      onSuccess: () => {
        reset();
        setOpen(false);
      },
    });
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
                  {players?.map((item) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name="playerIds"
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
              name="captain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Captain (Optional)</FormLabel>

                  <Select
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

export default AddTeamFormDialog;
