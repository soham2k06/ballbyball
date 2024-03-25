import { Dispatch, SetStateAction, useEffect } from "react";

import { CurPlayer } from "@prisma/client";
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
import { MatchExtended } from "@/types";

interface SelectBowlerProps {
  match: MatchExtended;
  open: boolean;
  setOpen?: Dispatch<SetStateAction<boolean>>;
  onClose?: () => void;
  curPlayers: CurPlayer[];
  setCurPlayers: Dispatch<SetStateAction<CurPlayer[]>>;
  handleSave: (_: unknown, updatedCurPlayers?: CurPlayer[]) => void;
  handleUndo?: () => void;
  isManualMode?: boolean;
}

function SelectBowler({
  open,
  setOpen,
  match,
  handleSave,
  handleUndo,
  curPlayers,
  setCurPlayers,
  isManualMode,
}: SelectBowlerProps) {
  const team = match?.teams[match?.curTeam === 0 ? 1 : 0];
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

    handleSave(0, newCurPlayers);

    setTimeout(reset, 500);
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
  // TODO: Update isModified state on submit
  // TODO: Openable manually
  // TODO: New reusable component for player label

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent removeCloseButton>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <TypographyH3 className="text-2xl font-bold">
              Select Bowler - {team?.name}
            </TypographyH3>
            {!!match?.curPlayers.find((player) => player.type === "bowler") && (
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
              <Button>Submit</Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SelectBowler;
