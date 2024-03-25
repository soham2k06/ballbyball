import { Player } from "@prisma/client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState } from "react";
import { Label } from "../ui/label";

interface FieldersDialogProps {
  wicketTypeId: string | null;
  setWicketTypeId: (fielderId: string | null) => void;
  fielders: Player[] | undefined;
  handleScore: (wicketTypeId: number, fielderId: string, runs: number) => void;
}

function FieldersDialog({
  wicketTypeId,
  setWicketTypeId,
  fielders,
  handleScore,
}: FieldersDialogProps) {
  const [runs, setRuns] = useState(0);

  if (!fielders) return <p>No fielders</p>;

  return (
    <Dialog open={!!wicketTypeId} onOpenChange={setWicketTypeId as any}>
      <DialogContent>
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
      </DialogContent>
    </Dialog>
  );
}

export default FieldersDialog;
