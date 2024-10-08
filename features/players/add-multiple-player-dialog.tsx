import { zodResolver } from "@hookform/resolvers/zod";
import { Player } from "@prisma/client";
import { Minus, Plus } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { createMultiplePlayers } from "@/lib/actions/player";
import { useActionMutate } from "@/lib/hooks";
import { toastError } from "@/lib/utils";
import { OverlayStateProps } from "@/types";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import LoadingButton from "@/components/ui/loading-button";

const uniqueArray = (arr: string[]) => new Set(arr).size === arr.length;

const schema = z.object({
  names: z
    .array(z.string().min(1).max(20))
    .min(1)
    .refine((value) => uniqueArray(value), {
      message: "Player names must be unique.",
    }),
});

interface AddMultiplePlayersDialogProps extends OverlayStateProps {
  setPlayerData: React.Dispatch<React.SetStateAction<(Player | undefined)[]>>;
}

function AddMultiplePlayersDialog({
  open,
  setOpen,
  setPlayerData,
}: AddMultiplePlayersDialogProps) {
  const form = useForm<{ names: string[] }>({
    resolver: zodResolver(schema),
  });

  const { handleSubmit, control, reset } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "names" as never,
    shouldUnregister: false,
  });

  const { mutate, isPending } = useActionMutate(createMultiplePlayers);

  function onSubmit(data: { names: string[] }) {
    setPlayerData((prevData) => [
      ...prevData,
      ...(data.names.map((name) => {
        const newId = "optimistic" + Math.random().toString(36);
        return { name, id: newId };
      }) as Player[]),
    ]);
    setOpen(false);

    mutate(data.names, {
      onError: (error) => {
        toastError(error);
        setPlayerData((prevData) =>
          prevData.filter((player) => !data.names.includes(player?.name ?? "")),
        );
      },
      onSuccess: () => reset(),
    });
  }

  function handleAdd(index: number) {
    append("");
    setTimeout(() => {
      const lastInput = document.getElementById(`player-input-${index + 1}`);
      lastInput?.focus();
    }, 0);
  }

  function handleEnterKeyPress(
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAdd(index);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Multiple Player</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex h-96 flex-col justify-between"
          >
            <ul className="h-full space-y-4 overflow-y-auto p-1">
              {(fields.length
                ? fields
                : [{ id: Math.random().toString(36), name: "" }]
              ).map((name, index) => (
                <div key={name.id} className="flex items-center gap-4">
                  <FormField
                    name={`names.${index}`}
                    control={control}
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormControl>
                          <Input
                            autoFocus
                            id={`player-input-${index}`}
                            placeholder="Player name"
                            className="w-full"
                            {...field}
                            onKeyDown={(e) => handleEnterKeyPress(e, index)}
                          />
                        </FormControl>
                        <FormMessage />
                        {!!form.formState.errors.names?.root && (
                          <p className="text-sm font-medium text-destructive">
                            {form.formState.errors.names?.root.message}
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      className="aspect-square p-0"
                      onClick={() => remove(index)}
                    >
                      <Minus size={20} />
                    </Button>
                  )}
                </div>
              ))}
            </ul>

            <div className="sticky bottom-0 mt-4 flex gap-2 bg-popover">
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleAdd(fields.length)}
              >
                <Plus /> Add Field
              </Button>
              <LoadingButton
                type="submit"
                disabled={isPending}
                loading={isPending}
              >
                {isPending ? "Adding..." : "Add Players"}
              </LoadingButton>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default AddMultiplePlayersDialog;
