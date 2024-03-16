import { Dialog, DialogContent } from "../ui/dialog";
import { BallEvent, CurPlayer, Match } from "@prisma/client";
import { useTeamById } from "@/hooks/api/team/useTeamById";
import { usePlayersByIds } from "@/hooks/api/player/usePlayersByIds";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { useForm } from "react-hook-form";
import { Checkbox } from "../ui/checkbox";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { TypographyH3 } from "../ui/typography";
import { Dispatch, SetStateAction, useEffect } from "react";
import { CreateBallEventSchema } from "@/lib/validation/ballEvent";
import { toast } from "sonner";
import PlayerLabel from "./PlayerLabel";

interface SelectBatsmanProps {
  match: Match;
  open: boolean;
  events: BallEvent[] | CreateBallEventSchema[];
  curPlayers: CurPlayer[];
  setCurPlayers: Dispatch<SetStateAction<CurPlayer[]>>;
  handleSave: (_: unknown, updatedCurPlayers?: CurPlayer[]) => void;
  handleUndo: () => void;
}

interface SelectBatsmanForm {
  playerIds: string[];
}

function SelectBatsman({
  curPlayers,
  match,
  events,
  open,
  handleSave,
  handleUndo,
  setCurPlayers,
}: SelectBatsmanProps) {
  const schema = z.object({
    playerIds: z.array(z.string()).max(2),
  });
  const defaultPlayerIds = curPlayers
    .filter((player) => player.type === "batsman")
    .map((player) => player.id);
  const form = useForm<SelectBatsmanForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      playerIds: defaultPlayerIds,
    },
  });

  const outPlayers = events
    ?.filter((event) => event.type === "-1")
    .map((event) => event.batsmanId);

  const { handleSubmit, control, getValues, watch, reset } = form;

  const { team } = useTeamById(match?.teamIds[match.curTeam]!);
  const { players } = usePlayersByIds([team?.playerIds!]);

  const playerPositions = ["Striker", "Non-Striker"];

  async function onSubmit(data: SelectBatsmanForm) {
    const newCurPlayers = data.playerIds
      .filter(
        (id) => curPlayers.find((curPlayer) => curPlayer.id === id)?.id !== id,
      )
      .map((id) => ({ id, type: "batsman" }));

    setCurPlayers([...curPlayers, ...newCurPlayers]);

    // 0 is trash value
    handleSave(0, newCurPlayers);

    setTimeout(reset, 500);
  }

  useEffect(() => {
    if (open)
      reset({
        playerIds: defaultPlayerIds,
      });
  }, [open]);

  useEffect(() => {
    watch("playerIds");
  }, [watch("playerIds")]);

  // TODO: Fix strike after out
  // TODO: Openable manually
  // TODO: New reusable component for player label

  return (
    <Dialog open={open}>
      <DialogContent removeCloseButton>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <TypographyH3>Select Batsman</TypographyH3>
            {!!curPlayers.length && (
              <Button variant="destructive" onClick={handleUndo}>
                Undo
              </Button>
            )}
          </div>
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
                          const isOut = outPlayers?.includes(item.id);

                          const sortedCurPlayers = curPlayers.sort((a, b) =>
                            a.type.localeCompare(b.type),
                          );
                          const isAlreadyPlaying =
                            sortedCurPlayers[0]?.id === item.id;

                          return (
                            <FormItem key={item.id}>
                              <FormControl>
                                <Checkbox
                                  className="sr-only"
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    if (isAlreadyPlaying) {
                                      toast.info("Player is already playing", {
                                        description:
                                          "Go to manual mode to hard change",
                                      });
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

                              <PlayerLabel
                                title={item.name}
                                isSelected={isSelected}
                                isOpacityDown={
                                  (isBothSelected && !isSelected) ||
                                  isAlreadyPlaying
                                }
                                isBrightnessDown={isOut}
                                subTitle={
                                  isOut
                                    ? "Out"
                                    : Array.from(
                                        { length: 2 },
                                        (_: unknown, i) =>
                                          field.value?.[i] === item.id &&
                                          playerPositions[i],
                                      )
                                }
                              />
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
