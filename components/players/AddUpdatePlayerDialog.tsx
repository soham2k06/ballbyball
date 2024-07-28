import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { OverlayStateProps } from "@/types";
import {
  CreatePlayerSchema,
  UpdatePlayerSchema,
  createPlayerSchema,
} from "@/lib/validation/player";

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
import LoadingButton from "@/components/ui/loading-button";
import { createPlayer, updatePlayer } from "@/lib/actions/player";
import { toast } from "sonner";
import { useActionMutate } from "@/lib/hooks";
import { toastError } from "@/lib/utils";

interface AddUpdatePlayerDialogProps extends OverlayStateProps {
  playerToUpdate?: UpdatePlayerSchema;
}

function AddUpdatePlayerDialog({
  open,
  setOpen,
  playerToUpdate,
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

  const { mutate: createMutate, isPending: isCreating } =
    useActionMutate(createPlayer);
  const { mutate: updateMutate, isPending: isUpdating } =
    useActionMutate(updatePlayer);

  const isPending = isCreating || isUpdating;

  async function onSubmit(data: CreatePlayerSchema | UpdatePlayerSchema) {
    if (!!playerToUpdate) {
      updateMutate(
        { id: playerToUpdate.id, ...data },
        {
          onSuccess: () => {
            reset();
            setOpen(false);
          },
        },
      );
      return;
    }

    createMutate(data, {
      onError: (error) => toastError(error),
      onSuccess: () => {
        toast.success("Player successfully created!");
        setOpen(false);
      },
    });
  }

  useEffect(() => {
    if (open && playerToUpdate) reset(playerToUpdate);
  }, [open, playerToUpdate]);

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
              <LoadingButton
                type="submit"
                disabled={isPending || !isDirty}
                loading={isPending}
              >
                {isPending
                  ? !!playerToUpdate
                    ? "Updating..."
                    : "Adding..."
                  : !!playerToUpdate
                    ? "Update"
                    : "Add"}
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default AddUpdatePlayerDialog;
