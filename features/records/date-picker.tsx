"use client";

import * as React from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { Cross1Icon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function DatePicker() {
  const router = useRouter();
  const sp = useSearchParams();
  const selectedDate = sp.get("date");
  const user = sp.get("user");

  return (
    <Popover>
      <div className="relative">
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
        {selectedDate && (
          <Button
            className="absolute right-2 top-1/2 size-6 -translate-y-1/2 p-0"
            variant="ghost"
            onClick={() => {
              router.push(user ? `/records?user=${user}` : "/records");
            }}
          >
            <Cross1Icon className="size-3" />
          </Button>
        )}
      </div>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selectedDate ? new Date(selectedDate) : undefined}
          onSelect={(date) => {
            if (date) {
              const dateQuery = `date=${format(date, "yyyy-MM-dd")}`;
              router.push(
                user
                  ? `/records?${user}&${dateQuery}`
                  : `/records?${dateQuery}`,
              );
            }
          }}
          toDate={new Date()}
        />
      </PopoverContent>
    </Popover>
  );
}
