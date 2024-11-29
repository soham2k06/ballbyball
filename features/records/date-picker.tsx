"use client";

import * as React from "react";

import { Cross1Icon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date?: string | null;
  // eslint-disable-next-line no-unused-vars
  setDate: (date: string | null) => void;
}

export default function DatePicker({ date, setDate }: DatePickerProps) {
  const isMobile = useMediaQuery("(max-width: 640px)");

  return (
    <div className="flex gap-2 max-sm:w-full">
      {date && (
        <Button
          variant="secondary"
          onClick={() => setDate(null)}
          disabled={!date}
          size="icon"
          className="shrink-0"
        >
          <Cross1Icon className="size-3" />
        </Button>
      )}
      {isMobile ? (
        <Input
          type="date"
          placeholder="Filter by a date"
          className="w-full justify-center"
          max={format(new Date(), "yyyy-MM-dd")}
          value={date ?? undefined}
          onChange={(e) => {
            const val = e.target.value;
            setDate(val);
          }}
        />
      ) : (
        <Popover>
          <div className="relative max-sm:w-full">
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal sm:w-[280px]",
                  !date && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "dd MMMM yyyy") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
          </div>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date ? new Date(date) : undefined}
              onSelect={(date) => {
                if (date) setDate(format(date, "yyyy-MM-dd"));
              }}
              toDate={new Date()}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
