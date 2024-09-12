import { BarChart3, ListOrdered } from "lucide-react";

import { EventType } from "@/types";

import { Separator } from "../ui/separator";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";

import OverStats from "./OverStats";
import { Button } from "../ui/button";
import { calcRuns, generateOverSummary } from "@/lib/utils";
import BallSummary from "../scorer/BallSummary";

function FooterSummary({
  curOverRuns,
  curOverWickets,
  extras,
  runRate,
  ballEvents,
}: {
  curOverRuns: number;
  curOverWickets: number;
  extras: number;
  runRate: number;
  ballEvents: EventType[];
}) {
  const { overSummaries } = generateOverSummary(ballEvents);

  return (
    <div className="flex w-full items-center justify-between rounded-md bg-muted p-2 text-lg text-muted-foreground">
      <div className="flex items-center">
        <span>Extras: {extras}</span>
        <Separator
          orientation="vertical"
          className="mx-2 h-6 bg-muted-foreground"
        />
        <span>
          This Over: {curOverRuns || 0}/{curOverWickets || 0}
        </span>
      </div>

      <div className="flex gap-2">
        <Drawer>
          <DrawerTrigger asChild>
            <Button size="icon" name="bar-chart" title="bar chart">
              <BarChart3 />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className="mb-2 pb-4 pt-6 ">
              <DrawerTitle className="text-center text-2xl">
                CRR: {runRate}
              </DrawerTitle>
            </DrawerHeader>
            <OverStats ballEvents={ballEvents} runRate={runRate} />
          </DrawerContent>
        </Drawer>
        <Drawer preventScrollRestoration>
          <DrawerTrigger asChild>
            <Button size="icon" name="over-summary" title="over-summary">
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
              <ul className="h-[calc(100dvh-160px)] divide-y overflow-y-auto p-2">
                {overSummaries.map((over, overI) => {
                  const runs = calcRuns(over);
                  const wickets = over.filter((ball) =>
                    ball.includes("-1"),
                  ).length;
                  return (
                    <div
                      key={overI}
                      className="flex items-center gap-4 py-4 first:pt-0"
                    >
                      <div className="flex min-w-20 gap-2 whitespace-nowrap text-sm font-bold">
                        <h3>O. {overI + 1}</h3>
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
                <h2 className="text-2xl font-bold">
                  There is no data to show!
                </h2>
                <p>Start adding runs to see data</p>
              </div>
            )}
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}

export default FooterSummary;
