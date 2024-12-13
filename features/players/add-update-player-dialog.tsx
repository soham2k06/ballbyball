import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Player } from "@prisma/client";
import { useForm } from "react-hook-form";

import { createPlayer, updatePlayer } from "@/lib/actions/player";
import { useActionMutate } from "@/lib/hooks";
import { toastError } from "@/lib/utils";
import {
  CreatePlayerSchema,
  UpdatePlayerSchema,
  createPlayerSchema,
} from "@/lib/validation/player";
import { OverlayStateProps } from "@/types";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface AddUpdatePlayerDialogProps extends OverlayStateProps {
  playerToUpdate?: UpdatePlayerSchema;
  setPlayerData: React.Dispatch<React.SetStateAction<(Player | undefined)[]>>;
}

function AddUpdatePlayerDialog({
  open,
  setOpen,
  playerToUpdate,
  setPlayerData,
}: AddUpdatePlayerDialogProps) {
  const form = useForm<CreatePlayerSchema>({
    resolver: zodResolver(createPlayerSchema),
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { isDirty },
  } = form;

  const { mutate: createMutate } = useActionMutate(createPlayer);
  const { mutate: updateMutate } = useActionMutate(updatePlayer);

  async function onSubmit(data: CreatePlayerSchema | UpdatePlayerSchema) {
    if (!!playerToUpdate) {
      setPlayerData(
        (prevData) =>
          prevData.map((player) =>
            player?.id === playerToUpdate.id
              ? { id: player.id, ...data }
              : player,
          ) as Player[],
      );
      setOpen(false);
      updateMutate(
        { id: playerToUpdate.id, ...data },
        {
          onSuccess: () => reset(),
          onError: (error) => {
            setPlayerData(
              (prevData) =>
                prevData.map((player) =>
                  player?.id === playerToUpdate.id
                    ? { ...playerToUpdate, id: player.id }
                    : player,
                ) as Player[],
            );
            toastError(error);
          },
        },
      );
      return;
    }

    const newId = "optimistic" + Math.random().toString(36);
    setPlayerData((prevData) => [
      ...prevData,
      { id: newId, ...data } as Player,
    ]);
    setOpen(false);

    createMutate(data, {
      onError: (error) => {
        toastError(error);
        setPlayerData((prevData) =>
          prevData.filter((player) => player?.id !== newId),
        );
      },
    });
  }

  useEffect(() => {
    if (open && playerToUpdate) reset(playerToUpdate);
  }, [open, playerToUpdate, reset]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="rounded-md p-4">
        <DialogHeader>
          <DialogTitle>
            {!!playerToUpdate ? "Update" : "Add"} Player
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Player name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={!isDirty}>
                {!!playerToUpdate ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default AddUpdatePlayerDialog;
