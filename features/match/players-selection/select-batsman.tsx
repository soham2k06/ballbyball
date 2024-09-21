import { Dispatch, SetStateAction, useEffect, useMemo } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { BallEvent, CurPlayer, Player } from "@prisma/client";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { abbreviateEntity } from "@/lib/utils";
import { CreateBallEventSchema } from "@/lib/validation/ball-event";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { TypographyH3 } from "@/components/ui/typography";

import PlayerLabel from "./player-label";

interface SelectBatsmanProps {
  open: boolean;
  setOpen?: Dispatch<SetStateAction<boolean>>;
  events: BallEvent[] | CreateBallEventSchema[];
  curPlayers: CurPlayer[];
  handleUndo?: () => void;
  isManualMode?: boolean;
  team: {
    name?: string;
    players?: Player[];
  };
  // eslint-disable-next-line no-unused-vars
  handleSelectPlayer: (payload: CurPlayer[], onSuccess?: () => void) => void;
  allowSinglePlayer: boolean | undefined;
}

interface SelectBatsmanForm {
  playerIds: string[];
}

function SelectBatsman({
  curPlayers,
  events,
  open,
  setOpen,
  handleUndo,
  isManualMode,
  team,
  handleSelectPlayer,
  allowSinglePlayer,
}: SelectBatsmanProps) {
  const curTeamEvents = events?.filter((event) =>
    team?.players?.some((player) => player.id === event.batsmanId),
  );

  const schema = z.object({
    playerIds: z
      .array(z.string(), {
        message: "Select mininum players",
      })
      .min(allowSinglePlayer ? 1 : 2, { message: "Select mininum players" })
      .max(2),
  });

  const defaultPlayerIds = useMemo(
    () =>
      curPlayers
        .filter((player) => player.type === "batsman")
        .map((player) => player.id),
    [curPlayers],
  );

  const form = useForm<SelectBatsmanForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      playerIds: defaultPlayerIds,
    },
  });

  const outPlayers = events
    ?.filter((event) => event.type.includes("-1"))
    .map((event) => event.batsmanId);

  const { handleSubmit, control, getValues, reset } = form;

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

    setOpen?.(false);
    handleSelectPlayer(payload, () => {
      setTimeout(reset, 500);
    });
  }

  useEffect(() => {
    if (open)
      reset({
        playerIds: defaultPlayerIds,
      });
  }, [open, curPlayers, reset, defaultPlayerIds]);

  form.watch("playerIds");

  return (
    <Dialog open={open} onOpenChange={isManualMode ? setOpen : undefined}>
      <DialogContent removeCloseButton className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <TypographyH3>
            Select Batsman - {abbreviateEntity(team?.name ?? "")}
          </TypographyH3>
          {!!curPlayers.length && (
            <Button
              variant={isManualMode ? "ghost" : "destructive"}
              size={isManualMode ? "icon" : "default"}
              onClick={isManualMode ? () => setOpen?.(false) : handleUndo}
            >
              {isManualMode ? <X /> : "Undo"}
            </Button>
          )}
        </div>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              disabled={!getValues("playerIds")?.length}
              control={form.control}
              name="playerIds"
              render={() => (
                <FormItem>
                  <div className="max-h-96 overflow-auto">
                    {players?.map((item) => (
                      <FormField
                        key={item.id}
                        control={control}
                        name="playerIds"
                        render={({ field }) => {
                          const isSelected = field.value.includes(item.id);
                          const isBothSelected = field.value.length === 2;
                          const isOut = outPlayers?.includes(item.id);

                          const isAlreadyPlaying = curPlayers.find(
                            (player) => player.id === item.id,
                          );

                          return (
                            <FormItem key={item.id}>
                              <FormControl>
                                <Checkbox
                                  className="sr-only"
                                  checked={field.value.includes(item.id)}
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
                                isOpacityDown={
                                  (isBothSelected && !isSelected) ||
                                  (isAlreadyPlaying && !isManualMode)
                                }
                                isBrightnessDown={isOut}
                                subTitle={
                                  isOut
                                    ? "Out"
                                    : !curTeamEvents.length
                                      ? Array.from(
                                          { length: 2 },
                                          (_: unknown, i) =>
                                            field.value?.[i] === item.id &&
                                            playerPositions[i],
                                        )
                                      : undefined
                                }
                              />
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button>Submit</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default SelectBatsman;
