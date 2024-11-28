"use client";

import { useQueryState } from "nuqs";

import BattingRecords from "@/features/records/batting-records";
import BowlingRecords from "@/features/records/bowling-records";
import DatePicker from "@/features/records/date-picker";
import MVP from "@/features/records/mvp";

import { Select } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

function RecordsList() {
  const [date, setDate] = useQueryState("date");
  const [matches, setMatches] = useQueryState("matches");

  return (
    <Tabs defaultValue="runs" className="m-1">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <TabsList className="max-sm:w-full">
          <TabsTrigger className="max-sm:w-full" value="runs">
            Most Runs
          </TabsTrigger>
          <TabsTrigger className="max-sm:w-full" value="wickets">
            Most Wickets
          </TabsTrigger>
          <TabsTrigger className="max-sm:w-full" value="mvp">
            MVP
          </TabsTrigger>
        </TabsList>
        <div className="flex gap-2 max-sm:w-full">
          <DatePicker date={date} setDate={setDate} />
          <Select
            className="w-fit max-sm:w-full"
            value={matches ?? "10"}
            onChange={(e) => setMatches(e.target.value)}
          >
            <option value="all">All matches</option>
            <option value="5">Last 5 matches</option>
            <option value="10">Last 10 matches</option>
            <option value="20">Last 20 matches</option>
          </Select>
        </div>
      </div>
      <BattingRecords matches={matches} date={date} />
      <BowlingRecords matches={matches} date={date} />
      <MVP matches={matches} date={date} />
    </Tabs>
  );
}

export default RecordsList;
