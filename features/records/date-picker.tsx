"use client";

import * as React from "react";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useQueryState } from "nuqs";

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

export default function DatePicker() {
  const [selectedDate, setSelectedDate] = useQueryState("date");

  const isMobile = useMediaQuery("(max-width: 640px)");

  return (
    <div className="flex gap-2 max-sm:w-full">
      {isMobile ? (
        <Input
          type="date"
          className="w-full justify-center"
          max={format(new Date(), "yyyy-MM-dd")}
          value={selectedDate ?? undefined}
          placeholder="Filter by date"
          onChange={(e) => {
            const val = e.target.value;
            if (val) setSelectedDate(val);
            else setSelectedDate(null);
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
                  !selectedDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  format(selectedDate, "dd MMMM yyyy")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
          </div>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate ? new Date(selectedDate) : undefined}
              onSelect={(date) => {
                if (date) {
                  const formatted = format(date, "yyyy-MM-dd");
                  setSelectedDate(formatted);
                }
              }}
              toDate={new Date()}
            />
          </PopoverContent>
        </Popover>
      )}
      <Button
        variant="secondary"
        onClick={() => setSelectedDate(null)}
        disabled={!selectedDate}
      >
        Clear
      </Button>
    </div>
  );
}
