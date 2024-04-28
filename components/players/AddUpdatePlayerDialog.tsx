import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { OverlayStateProps } from "@/types";
import {
  CreatePlayerSchema,
  UpdatePlayerSchema,
  createPlayerSchema,
} from "@/lib/validation/player";
import { useCreatePlayer, useUpdatePlayer } from "@/apiHooks/player";

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
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import LoadingButton from "@/components/ui/loading-button";
import { UploadButton } from "@/lib/uploadthing";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { processTeamName } from "@/lib/utils";

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
    setError,
    formState: { isDirty },
  } = form;

  const { createPlayer, isPending: isCreating } = useCreatePlayer();
  const { udpatePlayer, isPending: isUpdating } = useUpdatePlayer();

  const isPending = isCreating || isUpdating;

  function onSubmit(data: CreatePlayerSchema | UpdatePlayerSchema) {
    if (!!playerToUpdate) {
      udpatePlayer(
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
    createPlayer(data, {
      onSuccess: () => {
        reset();
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
            <FormField
              control={control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image (optional)</FormLabel>
                  <div className="flex gap-4">
                    <Avatar>
                      <AvatarImage
                        src={form.watch("image")}
                        alt="player"
                        width={60}
                        height={60}
                      />
                      <AvatarFallback>
                        {processTeamName(form.watch("name") ?? "")}
                      </AvatarFallback>
                    </Avatar>
                    <FormControl>
                      <UploadButton
                        appearance={{ allowedContent: { display: "none" } }}
                        endpoint="imageUploader"
                        onClientUploadComplete={(res) =>
                          field.onChange(res[0].url)
                        }
                        onUploadError={(error: Error) =>
                          setError("image", { message: error.message })
                        }
                      />
                    </FormControl>
                  </div>
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
