import { Dialog, DialogContent } from "../ui/dialog";
import { BallEvent, CurPlayer, Match } from "@prisma/client";
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
import { Dispatch, SetStateAction, useEffect } from "react";
import { CreateBallEventSchema } from "@/lib/validation/ballEvent";
import { toast } from "sonner";

interface SelectBatsmanProps {
  match: Match;
  open: boolean;
  events: BallEvent[] | CreateBallEventSchema[];
  curPlayers: CurPlayer[];
  setCurPlayers: Dispatch<SetStateAction<CurPlayer[]>>;
}

interface SelectBatsmanForm {
  playerIds: string[];
}

function SelectBatsman({
  curPlayers,
  match,
  open,
  events,
  setCurPlayers,
}: SelectBatsmanProps) {
  const schema = z.object({
    playerIds: z.array(z.string()).max(2),
  });
  const form = useForm<SelectBatsmanForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      playerIds: curPlayers.map((player) => player.id),
    },
  });

  const outPlayers = events
    ?.filter((event) => event.type === "-1")
    .map((event) => event.batsmanId);

  const { handleSubmit, control, getValues, watch, reset } = form;

  const { team } = useTeamById(match?.teamIds[match.curTeam]!);
  const { players } = usePlayersByIds([team?.playerIds!]);

  const playerPositions = ["Striker", "Non-Striker"];

  function onSubmit(data: SelectBatsmanForm) {
    const curPlayers = data.playerIds.map((id) => ({
      id,
      type: "batsman",
    }));
    setCurPlayers(curPlayers);

    setTimeout(reset, 500);
  }

  useEffect(() => {
    if (open)
      reset({
        playerIds: curPlayers.map((player) => player.id),
      });
  }, [open]);

  useEffect(() => {
    watch("playerIds");
  }, []);

  // TODO: Fix strike
  // TODO: Openable manually
  // TODO: New reusable component for player label

  return (
    <Dialog open={open}>
      <DialogContent>
        <div className="flex flex-col gap-4">
          <TypographyH3 className="text-2xl font-bold">
            Select Batsman
          </TypographyH3>
          <Form {...form}>
            {/* TODO: Search field HERE to filter players */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <FormField
                disabled={getValues("playerIds")?.length !== 2}
                control={form.control}
                name="playerIds"
                render={() => (
                  <FormItem>
                    {players?.[0]?.map((item) => (
                      <FormField
                        key={item.id}
                        control={control}
                        name="playerIds"
                        render={({ field }) => {
                          const isSelected = field.value?.includes(item.id);
                          const isBothSelected = field.value?.length === 2;
                          const isAlreadyPlaying = curPlayers[0].id === item.id;
                          const isOut = outPlayers?.includes(item.id);

                          return (
                            <FormItem key={item.id}>
                              <FormControl>
                                <Checkbox
                                  className="sr-only"
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    if (isAlreadyPlaying) {
                                      toast.info("Player is already playing");
                                      return;
                                    }
                                    if (
                                      (isBothSelected && !isSelected) ||
                                      isOut
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
                                      isSelected,
                                    "opacity-50": isBothSelected && !isSelected,
                                    "brightness-50": isOut,
                                  },
                                )}
                              >
                                {item.name}
                                {isOut && <span>OUT</span>}
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
