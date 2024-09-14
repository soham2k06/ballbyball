import { useState } from "react";

import { Player } from "@prisma/client";

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
  wicketTypeId: string | null;
  // eslint-disable-next-line no-unused-vars
  setWicketTypeId: (fielderId: string | null) => void;
  fielders: Player[] | undefined;
  // eslint-disable-next-line no-unused-vars
  handleScore: (wicketTypeId: number, fielderId: string, runs: number) => void;
}

function FieldersDialog({
  wicketTypeId,
  setWicketTypeId,
  fielders,
  handleScore,
}: FieldersDialogProps) {
  const [runs, setRuns] = useState(0);

  return (
    <Dialog open={!!wicketTypeId} onOpenChange={() => setWicketTypeId(null)}>
      <DialogContent>
        {fielders?.length ? (
          <>
            <DialogHeader>
              <DialogTitle>Who was the fielder?</DialogTitle>
            </DialogHeader>
            {Number(wicketTypeId) === 5 && (
              <>
                <Label>Runs along with run out</Label>
                <Input
                  type="number"
                  value={runs}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value < 0) return;
                    setRuns(value);
                  }}
                />
              </>
            )}
            <div className="grid grid-cols-2 gap-2">
              {fielders.map((fielder) => (
                <Button
                  key={fielder.id}
                  onClick={() => {
                    handleScore(Number(wicketTypeId), fielder.id, runs);
                    setWicketTypeId(null);
                  }}
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
