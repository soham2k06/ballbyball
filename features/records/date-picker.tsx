"use client";

import * as React from "react";

import { Cross1Icon } from "@radix-ui/react-icons";
import { format, set } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";

interface DatePickerProps {
  date?: string | null;
  // eslint-disable-next-line no-unused-vars
  setDate: (date: string | null) => void;
}

const months = Array.from({ length: 12 }, (_, i) => i);

const years = Array.from(
  { length: 10 },
  (_, i) => new Date().getFullYear() - i,
);

export default function DatePicker({ date, setDate }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const [monthYear, setMonthYear] = React.useState<
    | {
        month: number | undefined;
        year: number | undefined;
      }
    | undefined
  >({
    month: date
      ? parseInt(format(new Date(date), "MM"))
      : new Date().getMonth() + 1,
    year: date
      ? parseInt(format(new Date(date), "yyyy"))
      : new Date().getFullYear(),
  });

  const dateByMonthAndYear = React.useMemo(() => {
    if (!monthYear) return new Date();
    return set(new Date(), {
      year: monthYear.year,
      month: (monthYear.month ?? 0) - 1,
      date: 1,
    });
  }, [monthYear]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="relative max-sm:w-full">
        {date && (
          <Button
            variant="secondary"
            onClick={() => setDate(null)}
            disabled={!date}
            size="icon"
            className="absolute right-2 top-1/2 size-5 -translate-y-1/2"
          >
            <Cross1Icon className="size-3" />
          </Button>
        )}
        <DialogTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal sm:w-[180px]",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "dd MMM yyyy") : <span>Pick a date</span>}
          </Button>
        </DialogTrigger>
      </div>
      <DialogContent className="w-auto max-sm:p-4">
        <DialogHeader>
          <DialogTitle>Pick a date</DialogTitle>
        </DialogHeader>

        <div className="flex h-fit gap-2">
          <Select
            value={monthYear?.year}
            onChange={(e) => {
              setMonthYear((prev) => ({
                month: prev?.month,
                year: parseInt(e.target.value),
              }));
            }}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </Select>
          <Select
            value={monthYear?.month}
            onChange={(e) => {
              setMonthYear((prev) => ({
                year: prev?.year,
                month: parseInt(e.target.value),
              }));
            }}
          >
            {months.map((i) => (
              <option key={i} value={i + 1}>
                {format(new Date(0, i), "MMMM")}
              </option>
            ))}
          </Select>
        </div>
        <Calendar
          className="p-0"
          mode="single"
          selected={date ? new Date(date) : undefined}
          onSelect={(date) => {
            if (date) {
              setDate(format(date, "yyyy-MM-dd"));
              setOpen(false);
            }
          }}
          month={dateByMonthAndYear}
          toDate={new Date()}
          onMonthChange={(month) => {
            setMonthYear(() => ({
              month: month.getMonth() + 1,
              year: month.getFullYear(),
            }));
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
