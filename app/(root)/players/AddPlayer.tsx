"use client";

import {
  CreatePlayerSchema,
  createPlayerSchema,
} from "@/lib/validation/player";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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

import { Textarea } from "@/components/ui/textarea";

import { useRouter } from "next/navigation";

import LoadingButton from "../../../components/ui/loading-button";
import { Input } from "@/components/ui/input";
import { Button } from "../../../components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface AddEditNoteDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

function AddPlayerFormDialog({ open, setOpen }: AddEditNoteDialogProps) {
  const router = useRouter();

  const form = useForm<CreatePlayerSchema>({
    resolver: zodResolver(createPlayerSchema),
  });
  const { handleSubmit, control, formState, reset } = form;

  async function onSubmit(data: CreatePlayerSchema) {
    try {
      const res = await fetch("/api/players", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Status code: " + res.status);
      reset();

      toast.success("Player added successfully");
      // router.refresh();
      setOpen(false);
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    }
  }

  //   async function deleteNote() {
  //     setIsDeleting(true);
  //     try {
  //       const res = await fetch("/api/notes", {
  //         method: "DELETE",
  //         body: JSON.stringify({ id: noteToEdit.id }),
  //       });
  //       if (!res.ok) throw new Error("Status code: " + res.status);
  //       router.refresh();
  //       setOpen(false);
  //     } catch (error) {
  //       console.error(error);
  //       alert("Something went wrong. Please try again.");
  //     } finally {
  //       setIsDeleting(false);
  //     }
  //   }

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
            <FormField
              control={control}
              name="desc"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea placeholder="Player description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <LoadingButton
                type="submit"
                disabled={formState.isSubmitting}
                loading={formState.isSubmitting}
              >
                {formState.isSubmitting ? "Adding..." : "Add"}
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function AddPlayerButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Add Player</Button>
      <AddPlayerFormDialog open={open} setOpen={setOpen} />
    </>
  );
}

export default AddPlayerButton;
