import { Dialog, DialogContent } from "../ui/dialog";
import { Match } from "@prisma/client";
import { useTeamById } from "@/hooks/api/team/useTeamById";
import { usePlayersByIds } from "@/hooks/api/player/usePlayersByIds";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { useForm } from "react-hook-form";
import { Checkbox } from "../ui/checkbox";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { TypographyH3 } from "../ui/typography";

interface SelectBatsmanProps {
  match: Match;
}

interface SelectBatsmanForm {
  playerIds: string[];
}

function SelectBatsman({ match }: SelectBatsmanProps) {
  const schema = z.object({
    playerIds: z.array(z.string()).max(2),
  });
  const form = useForm<SelectBatsmanForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      playerIds: [],
    },
  });

  const { handleSubmit, control, getValues } = form;
  const { team } = useTeamById(match?.teamIds[match.curTeam]!);

  const { players } = usePlayersByIds([team?.playerIds!]);

  const playerPositions = ["Striker", "Non-Striker"];

  function onSubmit(data) {
    console.log(data);
  }

  return (
    <Dialog open>
      <DialogContent>
        <div className="flex flex-col gap-4">
          <TypographyH3 className="text-2xl font-bold">
            Select Batsman
          </TypographyH3>
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FormField
                disabled={getValues("playerIds")?.length !== 2}
                control={form.control}
                name="playerIds"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-base">Players</FormLabel>
                    {players?.[0]?.map((item) => (
                      <FormField
                        key={item.id}
                        control={control}
                        name="playerIds"
                        render={({ field }) => {
                          return (
                            <FormItem key={item.id}>
                              <FormControl>
                                <Checkbox
                                  className="sr-only"
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    if (
                                      field.value.length === 2 &&
                                      !field.value?.includes(item.id)
                                    )
                                      return;
                                    return checked
                                      ? field.onChange([
                                          ...field.value,
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
                              <FormLabel
                                className={cn(
                                  "flex h-8 w-full items-center justify-between bg-muted p-2 font-normal",
                                  {
                                    "bg-emerald-500 font-bold text-emerald-950":
                                      field.value?.includes(item.id),
                                    "opacity-50":
                                      field.value?.length === 2 &&
                                      !field.value?.includes(item.id),
                                  },
                                )}
                              >
                                {item.name}
                                <span className="whitespace-nowrap text-sm font-semibold">
                                  {Array.from(
                                    { length: 2 },
                                    (_: unknown, i) =>
                                      field.value?.[i] === item.id &&
                                      playerPositions[i],
                                  )}
                                </span>
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
              <Button>Submit</Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SelectBatsman;
