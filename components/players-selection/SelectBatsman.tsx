import { Dispatch, SetStateAction, useEffect } from "react";

import { BallEvent, CurPlayer } from "@prisma/client";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Dialog, DialogContent } from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";

import { Checkbox } from "../ui/checkbox";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../ui/button";
import { TypographyH3 } from "../ui/typography";

import { CreateBallEventSchema } from "@/lib/validation/ballEvent";
import PlayerLabel from "./PlayerLabel";
import { X } from "lucide-react";
import { MatchExtended } from "@/types";

interface SelectBatsmanProps {
  match: MatchExtended;
  open: boolean;
  setOpen?: Dispatch<SetStateAction<boolean>>;
  events: BallEvent[] | CreateBallEventSchema[];
  curPlayers: CurPlayer[];
  setCurPlayers: Dispatch<SetStateAction<CurPlayer[]>>;
  handleSave: (_: unknown, updatedCurPlayers?: CurPlayer[]) => void;
  handleUndo?: () => void;
  isManualMode?: boolean;
}

interface SelectBatsmanForm {
  playerIds: string[];
}

function SelectBatsman({
  curPlayers,
  match,
  events,
  open,
  setOpen,
  handleSave,
  handleUndo,
  setCurPlayers,
  isManualMode,
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

  const team = match?.teams[match.curTeam];
  const players = team?.players;

  const playerPositions = ["Striker", "Non-Striker"];

  async function onSubmit(data: SelectBatsmanForm) {
    const newCurPlayers: CurPlayer[] = data.playerIds
      .filter(
        (id) => curPlayers.find((curPlayer) => curPlayer.id === id)?.id !== id,
      )
      .map((id) => ({ id, type: "batsman" }));

    const prevBowler = curPlayers.find((player) => player.type === "bowler");
    const payload = prevBowler
      ? [
          ...newCurPlayers,
          ...curPlayers.filter((player) => data.playerIds.includes(player.id)),
          prevBowler,
        ]
      : [
          ...newCurPlayers,
          ...curPlayers.filter((player) => data.playerIds.includes(player.id)),
        ];
    setCurPlayers(payload);

    // 0 is trash value
    handleSave(0, payload);

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
  // TODO: Openable manually // DONE
  // TODO: New reusable component for player label // DONE

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent removeCloseButton>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <TypographyH3>Select Batsman - {team?.name}</TypographyH3>
            {!!curPlayers.length && (
              <Button
                variant={isManualMode ? "ghost" : "destructive"}
                size={isManualMode ? "icon" : "default"}
                onClick={
                  isManualMode ? () => setOpen && setOpen(false) : handleUndo
                }
              >
                {isManualMode ? <X /> : "Undo"}
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
                    {players?.map((item) => (
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
                                    if (isAlreadyPlaying && !isManualMode) {
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
                                  (isAlreadyPlaying && !isManualMode)
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
