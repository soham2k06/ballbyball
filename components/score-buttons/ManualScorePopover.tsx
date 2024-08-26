import { MouseEvent, MouseEventHandler, useState } from "react";

import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

import { Menu, X } from "lucide-react";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";

function ManualScorePopover({
  handleScore,
}: {
  handleScore: MouseEventHandler<HTMLButtonElement>;
}) {
  const limitError = "Enter Manual runs between 1 and 9";
  const schema = z.object({
    manualRuns: z
      .number({ message: "Please add a number only" })
      .min(1, limitError)
      .max(9, limitError),
  });
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const ballEvents = [
    { type: "-4", label: "Swap Strike" },
    { type: "3", label: "3" },
    { type: "5", label: "5" },
  ];

  function handleManualRuns(data: z.infer<typeof schema>) {
    const manualRuns = data.manualRuns;

    const manualRunsToPass =
      manualRuns < 0 ? `-${manualRuns}` : manualRuns.toString();
    handleScore({
      currentTarget: { value: manualRunsToPass },
    } as MouseEvent<HTMLButtonElement>);

    form.reset({ manualRuns: 0 });
    setIsPopoverOpen(false);
  }

  return (
    <Popover
      open={isPopoverOpen}
      modal
      onOpenChange={() => setIsPopoverOpen((prev) => !prev)}
    >
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          className="size-20 w-full text-lg text-muted-foreground"
          value="-4"
        >
          {isPopoverOpen ? (
            <X className="size-5" />
          ) : (
            <Menu className="size-5" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <ul className="flex gap-2">
            {ballEvents.map((event, i) => (
              <Button
                key={i}
                variant="secondary"
                className="w-full"
                value={event.type}
                onClick={(e) => {
                  handleScore(e);
                  setIsPopoverOpen(false);
                }}
              >
                {event.label}
              </Button>
            ))}
          </ul>
          {
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleManualRuns)}>
                <FormField
                  control={form.control}
                  name="manualRuns"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex w-full items-center gap-2">
                        <FormControl>
                          <Input
                            type="number"
                            className="w-full"
                            placeholder="Manual Score"
                            {...field}
                            onChange={(e) => {
                              field.onChange(parseInt(e.target.value));
                            }}
                          />
                        </FormControl>
                        <Button size="sm">Add</Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          }
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default ManualScorePopover;
