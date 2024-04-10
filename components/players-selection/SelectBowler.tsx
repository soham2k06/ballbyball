import { Dispatch, SetStateAction, useEffect } from "react";

import { CurPlayer, Player } from "@prisma/client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { cn } from "@/lib/utils";

import { Dialog, DialogContent } from "../ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Button } from "../ui/button";
import { TypographyH3 } from "../ui/typography";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import LoadingButton from "../ui/loading-button";

interface SelectBowlerProps {
  open: boolean;
  setOpen?: Dispatch<SetStateAction<boolean>>;
  curPlayers: CurPlayer[];
  setCurPlayers: Dispatch<SetStateAction<CurPlayer[]>>;
  handleUndo?: () => void;
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

  const queryClient = useQueryClient();

  const isPending = !!queryClient.isMutating({ mutationKey: ["updateMatch"] });

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
    if (open)
      reset({
        playerId: defaultBowler,
      });
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
              Select Bowler - {team?.name}
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
            {/* TODO: Search field HERE to filter players */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="playerId"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        {players?.map((player) => {
                          const isSelected = field.value?.includes(player.id);
                          const isBothSelected = field.value?.length === 1;
                          return (
                            <FormItem className="space-y-0">
                              <FormControl>
                                <RadioGroupItem
                                  value={player.id}
                                  className="sr-only"
                                />
                              </FormControl>
                              <FormLabel
                                className={cn(
                                  "flex h-8 w-full items-center justify-between bg-muted p-2 font-normal",
                                  {
                                    "bg-emerald-500 font-bold text-emerald-950":
                                      isSelected,
                                    "opacity-50": isBothSelected && !isSelected,
                                  },
                                )}
                              >
                                {player.name}
                              </FormLabel>
                            </FormItem>
                          );
                        })}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <LoadingButton loading={isPending} disabled={isPending}>
                {isPending ? "Submitting" : "Submit"}
              </LoadingButton>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SelectBowler;
