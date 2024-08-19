import { Dispatch, SetStateAction, useEffect } from "react";

import { CurPlayer, Player } from "@prisma/client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { processTeamName } from "@/lib/utils";

import { Dialog, DialogContent } from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Button } from "../ui/button";
import { TypographyH3 } from "../ui/typography";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { X } from "lucide-react";
import LoadingButton from "../ui/loading-button";
import PlayerLabel from "./PlayerLabel";

interface SelectBowlerProps {
  open: boolean;
  setOpen?: Dispatch<SetStateAction<boolean>>;
  curPlayers: CurPlayer[];
  setCurPlayers: Dispatch<SetStateAction<CurPlayer[]>>;
  handleUndo?: () => void;
  isUpdatingMatch: boolean;
  isManualMode?: boolean;
  team: {
    name?: string;
    players?: Player[];
  };
  handleSelectPlayer: (payload: CurPlayer[], onSuccess?: () => void) => void;
}

function SelectBowler({
  open,
  setOpen,
  handleUndo,
  curPlayers,
  setCurPlayers,
  isUpdatingMatch,
  isManualMode,
  team,
  handleSelectPlayer,
}: SelectBowlerProps) {
  const players = team?.players;

  const schema = z.object({
    playerId: z.string(),
  });

  const defaultBowler = curPlayers.find(
    (player) => player.type === "bowler",
  )?.id;

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      playerId: defaultBowler,
    },
  });

  const { handleSubmit, watch, reset } = form;

  function onSubmit(data: z.infer<typeof schema>) {
    const newBowler: CurPlayer = {
      id: data.playerId,
      type: "bowler",
    };

    const newCurPlayers = [
      ...curPlayers.filter((player) => player.type !== "bowler"),
      newBowler,
    ];

    setCurPlayers(newCurPlayers);

    handleSelectPlayer(newCurPlayers, () => {
      setOpen && setOpen(false);
      setTimeout(reset, 500);
    });
  }

  useEffect(() => {
    if (open) reset({ playerId: defaultBowler });
  }, [open]);

  useEffect(() => {
    watch("playerId");
  }, [watch("playerId")]);

  // TODO: Bowled last over

  return (
    <Dialog open={open} onOpenChange={isManualMode ? setOpen : undefined}>
      <DialogContent removeCloseButton>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <TypographyH3 className="text-2xl font-bold">
              Select Bowler - {processTeamName(team?.name ?? "")}
            </TypographyH3>
            {!!curPlayers.find((player) => player.type === "bowler") && (
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="playerId"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="max-h-96 overflow-auto"
                      >
                        {players?.map((player) => {
                          const isSelected = field.value?.includes(player.id);
                          const isBothSelected = field.value?.length === 1;
                          return (
                            <FormItem key={player.id} className="space-y-0">
                              <FormControl>
                                <RadioGroupItem
                                  value={player.id}
                                  className="sr-only"
                                />
                              </FormControl>
                              <PlayerLabel
                                title={player.name}
                                isSelected={isSelected}
                                isOpacityDown={isBothSelected && !isSelected}
                              />
                            </FormItem>
                          );
                        })}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <LoadingButton
                loading={isUpdatingMatch}
                disabled={isUpdatingMatch}
              >
                Submit
              </LoadingButton>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SelectBowler;
