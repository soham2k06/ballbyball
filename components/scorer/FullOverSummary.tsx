import { EventType } from "@/types";
import { Button } from "../ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import BallSummary from "./BallSummary";
import { calcRuns } from "@/lib/utils";

function FullOverSummary({ overSummaries }: { overSummaries: EventType[][] }) {
  return (
    <Drawer preventScrollRestoration>
      <DrawerTrigger asChild>
        <Button className="w-full">Summary</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="pt-6 pb-4 mb-2 shadow shadow-muted">
          <DrawerTitle className="text-2xl text-center">
            Overs Summary
          </DrawerTitle>
        </DrawerHeader>
        <div className="max-w-7xl mx-auto">
          {overSummaries.length > 0 ? (
            <ul className="divide-y p-2 max-h-[calc(100dvh-120px)] min-h-96 overflow-y-auto">
              {overSummaries.map((over, overI) => {
                const runs = calcRuns(over);
                const wickets = over.filter((ball) => ball === "-1").length;
                return (
                  <div
                    key={overI}
                    className="flex gap-4 py-4 items-center first:pt-0"
                  >
                    <div className="font-bold whitespace-nowrap min-w-28 flex gap-2">
                      <h3>Over {overI + 1}</h3>
                      <span>
                        ({runs}/{wickets})
                      </span>
                    </div>
                    <ul className="flex gap-2 overflow-x-auto">
                      {over.map((ball, ballI) => (
                        <BallSummary key={ballI} event={ball} size="sm" />
                      ))}
                    </ul>
                  </div>
                );
              })}
            </ul>
          ) : (
            <div className="h-full flex min-h-96 flex-col items-center justify-center text-center space-y-2">
              <h2 className="text-2xl font-bold">There is no data to show!</h2>
              <p>Start adding runs to see data</p>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default FullOverSummary;
