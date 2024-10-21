import { useState } from "react";

import { Player } from "@prisma/client";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FieldersDialogProps {
  curBatsmen: Player[];
  wicketTypeId: string | null;
  // eslint-disable-next-line no-unused-vars
  setWicketTypeId: (fielderId: string | null) => void;
  fielders: Player[] | undefined;
  handleScore: ({
    // eslint-disable-next-line no-unused-vars
    fielderId,
    // eslint-disable-next-line no-unused-vars
    wicketTypeId,
    // eslint-disable-next-line no-unused-vars
    customBatsman,
    // eslint-disable-next-line no-unused-vars
    runsAlongWithRunOut,
  }: {
    wicketTypeId: number;
    fielderId: string;
    runsAlongWithRunOut?: number;
    customBatsman?: string;
  }) => void;
}

function FieldersDialog({
  curBatsmen,
  wicketTypeId,
  setWicketTypeId,
  fielders,
  handleScore,
}: FieldersDialogProps) {
  const areTwoBatting = curBatsmen.length === 2;
  const [runs, setRuns] = useState(0);

  const [batsmanToRunout, setBatsmanToRunout] = useState<string | undefined>(
    undefined,
  );

  function handleSelectFielder(fielder: string) {
    handleScore({
      wicketTypeId: Number(wicketTypeId),
      fielderId: fielder,
      runsAlongWithRunOut: runs || 0,
      customBatsman: batsmanToRunout,
    });
    setWicketTypeId(null);
  }

  return (
    <Dialog open={!!wicketTypeId} onOpenChange={() => setWicketTypeId(null)}>
      <DialogContent>
        {fielders?.length ? (
          <>
            <DialogHeader>
              <DialogTitle>Who was the fielder?</DialogTitle>
            </DialogHeader>
            {Number(wicketTypeId) === 5 && (
              <div className="space-y-2">
                <div>
                  <Label>Runs along with run out</Label>
                  <Input
                    type="number"
                    value={runs}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (value < 0) return;
                      setRuns(value);
                    }}
                  />
                </div>
                {areTwoBatting && (
                  <div>
                    <Label htmlFor="who-is-runout">Who is runout?</Label>
                    <div className="flex gap-2">
                      {curBatsmen.map((batsman) => (
                        <button
                          key={batsman.id}
                          className={cn(
                            "flex w-full cursor-pointer items-center justify-between rounded bg-muted p-2 text-sm font-normal",
                            {
                              "bg-emerald-500 font-black text-emerald-950":
                                batsmanToRunout === batsman.id,
                            },
                          )}
                          onClick={() =>
                            setBatsmanToRunout((prev) =>
                              prev === batsman.id ? undefined : batsman.id,
                            )
                          }
                        >
                          {batsman.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              {fielders.map((fielder) => (
                <Button
                  key={fielder.id}
                  disabled={
                    Number(wicketTypeId) === 5 &&
                    areTwoBatting &&
                    !batsmanToRunout
                  }
                  onClick={() => handleSelectFielder(fielder.id)}
                >
                  {fielder.name}
                </Button>
              ))}
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export default FieldersDialog;
