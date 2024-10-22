import BattingRecords from "@/features/records/batting-records";
import BowlingRecords from "@/features/records/bowling-records";
import DatePicker from "@/features/records/date-picker";
import MVP from "@/features/records/mvp";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

function RecordsPage() {
  return (
    <div>
      <h1 className="mb-4 text-3xl font-semibold tracking-tight max-sm:text-xl">
        Records
      </h1>
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
          <DatePicker />
        </div>
        <BattingRecords />
        <BowlingRecords />
        <MVP />
      </Tabs>
    </div>
  );
}

export default RecordsPage;
