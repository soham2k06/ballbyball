"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import { Textarea } from "@/components/ui/textarea";

import LoadingButton from "@/components/ui/loading-button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CreateMatchSchema, createMatchSchema } from "@/lib/validation/match";
import { Button } from "../ui/button";

function StartMatch() {
  const route = useRouter();
  const form = useForm<CreateMatchSchema>({
    resolver: zodResolver(createMatchSchema),
  });
  const { handleSubmit, control, formState, reset } = form;

  async function onSubmit() {
    const body = {
      name: "IPL#1",
      teamIds: ["65e685bcc104dee7b6ba8f20"],
    };

    console.log(body);

    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Status code: " + res.status);
      reset();
      toast.success("Player added successfully");
      // route.back();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    }
  }
  return (
    <div>
      <Button onClick={onSubmit}>Call</Button>
    </div>
    // <Form {...form}>
    //   <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
    //     <FormField
    //       control={control}
    //       name="name"
    //       render={({ field }) => (
    //         <FormItem>
    //           <FormControl>
    //             <Input placeholder="Player name" {...field} />
    //           </FormControl>
    //           <FormMessage />
    //         </FormItem>
    //       )}
    //     />
    //     <FormField
    //       control={control}
    //       name="desc"
    //       render={({ field }) => (
    //         <FormItem>
    //           <FormControl>
    //             <Textarea placeholder="Player description" {...field} />
    //           </FormControl>
    //           <FormMessage />
    //         </FormItem>
    //       )}
    //     />

    //     <LoadingButton
    //       type="submit"
    //       disabled={formState.isSubmitting}
    //       loading={formState.isSubmitting}
    //     >
    //       {formState.isSubmitting ? "Adding..." : "Add"}
    //     </LoadingButton>
    //   </form>
    // </Form>
  );
}

export default StartMatch;
