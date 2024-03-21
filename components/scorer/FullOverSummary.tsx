import { ListOrdered } from "lucide-react";

import { EventType } from "@/types";
import { calcRuns } from "@/lib/utils";

import { Button } from "../ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import BallSummary from "./BallSummary";

function FullOverSummary({ overSummaries }: { overSummaries: EventType[][] }) {
  return (
    <Drawer preventScrollRestoration>
      <DrawerTrigger asChild>
        <Button size="icon">
          <ListOrdered />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="mb-2 pb-4 pt-6 shadow shadow-muted">
          <DrawerTitle className="text-center text-2xl">
            Overs Summary
          </DrawerTitle>
        </DrawerHeader>
        {overSummaries.length > 0 ? (
          <ul className="max-h-[calc(100dvh-120px)] min-h-96 divide-y overflow-y-auto p-2">
            {overSummaries.map((over, overI) => {
              const runs = calcRuns(over);
              const wickets = over.filter((ball) => ball === "-1").length;
              return (
                <div
                  key={overI}
                  className="flex items-center gap-4 py-4 first:pt-0"
                >
                  <div className="flex min-w-24 gap-2 whitespace-nowrap text-sm font-bold">
                    <h3>Over {overI + 1}</h3>
                    <span>
                      ({runs}/{wickets})
                    </span>
                  </div>
                  <ul className="flex h-12 items-center gap-2 overflow-x-auto">
                    {over.map((ball, ballI) => (
                      <BallSummary key={ballI} event={ball} size="sm" />
                    ))}
                  </ul>
                </div>
              );
            })}
          </ul>
        ) : (
          <div className="flex h-full min-h-96 flex-col items-center justify-center space-y-2 text-center">
            <h2 className="text-2xl font-bold">There is no data to show!</h2>
            <p>Start adding runs to see data</p>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}

export default FullOverSummary;
