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

import FullOverSummary from "./FullOverSummary";
import OverStats from "./OverStats";
import { Button } from "../ui/button";

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
            <Button size="icon">
              <BarChart3 />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className="mb-2 pb-4 pt-6 ">
              <DrawerTitle className="text-center text-2xl">
                CRR: {runRate}
              </DrawerTitle>
            </DrawerHeader>
            <OverStats ballEvents={ballEvents} />
          </DrawerContent>
        </Drawer>
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
            <FullOverSummary ballEvents={ballEvents} />
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}

export default FooterSummary;
