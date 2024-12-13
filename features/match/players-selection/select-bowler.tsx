import { Dispatch, SetStateAction, useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { CurPlayer, Player } from "@prisma/client";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { abbreviateEntity } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { TypographyH3 } from "@/components/ui/typography";

import PlayerLabel from "./player-label";

interface SelectBowlerProps {
  open: boolean;
  setOpen?: Dispatch<SetStateAction<boolean>>;
  curPlayers: CurPlayer[];
  handleUndo?: () => void;
  isManualMode?: boolean;
  team: {
    name?: string;
    players?: Player[];
  };
  // eslint-disable-next-line no-unused-vars
  handleSelectPlayer: (payload: CurPlayer[], onSuccess?: () => void) => void;
}

function SelectBowler({
  open,
  setOpen,
  handleUndo,
  curPlayers,
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

    setOpen?.(false);
    handleSelectPlayer(newCurPlayers, () => {
      setTimeout(reset, 500);
    });
  }

  useEffect(() => {
    if (open) reset({ playerId: defaultBowler });
  }, [defaultBowler, open, reset]);

  useEffect(() => {
    watch("playerId");
  }, [watch]);

  // TODO: Bowled last over

  return (
    <Dialog open={open} onOpenChange={isManualMode ? setOpen : undefined}>
      <DialogContent removeCloseButton>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <TypographyH3 className="text-2xl font-bold">
              Select Bowler - {abbreviateEntity(team?.name ?? "")}
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
              <Button>Submit</Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SelectBowler;
