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
import { useCreatePlayer } from "@/hooks/api/player/useCreatePlayer";
import {
  CreatePlayerSchema,
  createPlayerSchema,
} from "@/lib/validation/player";
import { OverlayStateProps } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

function AddPlayerFormDialog({ open, setOpen }: OverlayStateProps) {
  const form = useForm<CreatePlayerSchema>({
    resolver: zodResolver(createPlayerSchema),
  });

  const { handleSubmit, control, reset } = form;

  const { createPlayer, isPending } = useCreatePlayer();

  function onSubmit(data: CreatePlayerSchema) {
    createPlayer(data, {
      onSuccess: () => {
        reset();
        setOpen(false);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="rounded-md p-4">
        <DialogHeader>
          <DialogTitle>Add Player</DialogTitle>
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
                disabled={isPending}
                loading={isPending}
              >
                {isPending ? "Adding..." : "Add"}
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default AddPlayerFormDialog;
