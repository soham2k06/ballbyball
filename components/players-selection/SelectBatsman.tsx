import { Dispatch, SetStateAction, useEffect } from "react";

import { BallEvent, CurPlayer, Player } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { processTeamName } from "@/lib/utils";
import { CreateBallEventSchema } from "@/lib/validation/ballEvent";

import { Dialog, DialogContent } from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { TypographyH3 } from "../ui/typography";
import LoadingButton from "../ui/loading-button";

import PlayerLabel from "./PlayerLabel";

interface SelectBatsmanProps {
  open: boolean;
  setOpen?: Dispatch<SetStateAction<boolean>>;
  events: BallEvent[] | CreateBallEventSchema[];
  curPlayers: CurPlayer[];
  setCurPlayers: Dispatch<SetStateAction<CurPlayer[]>>;
  handleUndo?: () => void;
  isManualMode?: boolean;
  team: {
    name?: string;
    players?: Player[];
  };
  handleSelectPlayer: (payload: CurPlayer[], onSuccess?: () => void) => void;
  allowSinglePlayer: boolean | undefined;
  isLoading?: boolean;
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
  setCurPlayers,
  isManualMode,
  team,
  handleSelectPlayer,
  allowSinglePlayer,
  isLoading,
}: SelectBatsmanProps) {
  const schema = z.object({
    playerIds: z
      .array(z.string(), {
        errorMap: () => ({
          message: "Select two players",
        }),
      })
      .min(allowSinglePlayer ? 1 : 2, { message: "Select two players" })
      .max(2),
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
    ?.filter((event) => event.type.includes("-1"))
    .map((event) => event.batsmanId);

  const queryClient = useQueryClient();

  const isPending = !!queryClient.isMutating({ mutationKey: ["updateMatch"] });

  const { handleSubmit, control, getValues, watch, reset } = form;

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

    handleSelectPlayer(payload, () => {
      setOpen?.(false);
      setTimeout(reset, 500);
    });
  }

  useEffect(() => {
    if (open)
      reset({
        playerIds: defaultPlayerIds,
      });
  }, [open, curPlayers]);

  useEffect(() => {
    watch("playerIds");
  }, [watch("playerIds")]);

  // TODO: Fix strike after out

  return (
    <Dialog open={open} onOpenChange={isManualMode ? setOpen : undefined}>
      <DialogContent removeCloseButton className="flex flex-col gap-4">
        {!isLoading ? (
          <>
            <div className="flex items-center justify-between">
              <TypographyH3>
                Select Batsman - {processTeamName(team?.name ?? "")}
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
              {/* TODO: Search field HERE to filter players */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  disabled={!getValues("playerIds")?.length}
                  control={form.control}
                  name="playerIds"
                  render={() => (
                    <FormItem>
                      <div className="h-96 overflow-auto">
                        {players?.map((item) => (
                          <FormField
                            key={item.id}
                            control={control}
                            name="playerIds"
                            render={({ field }) => {
                              const isSelected = field.value.includes(item.id);
                              const isBothSelected = field.value.length === 2;
                              const isOut = outPlayers?.includes(item.id);

                              const sortedCurPlayers = curPlayers?.sort(
                                (a, b) => a.type.localeCompare(b.type),
                              );
                              const isAlreadyPlaying =
                                sortedCurPlayers[0]?.id === item.id;

                              return (
                                <FormItem key={item.id}>
                                  <FormControl>
                                    <Checkbox
                                      className="sr-only"
                                      checked={field.value.includes(item.id)}
                                      onCheckedChange={(checked) => {
                                        if (isAlreadyPlaying && !isManualMode) {
                                          toast.info(
                                            "Player is already playing",
                                            {
                                              description:
                                                "Go to manual mode to hard change",
                                            },
                                          );
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
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <LoadingButton loading={isPending} disabled={isPending}>
                  {isPending ? "Submitting" : "Submit"}
                </LoadingButton>
              </form>
            </Form>
          </>
        ) : (
          <div className="text-center">
            <TypographyH3>Updating Innings...</TypographyH3>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default SelectBatsman;
