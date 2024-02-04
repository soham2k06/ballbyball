import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import { MouseEventHandler } from "react";
function RestartButton({
  onClick,
  handleCloseMenu,
}: {
  onClick: MouseEventHandler;
  handleCloseMenu: MouseEventHandler;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive" className="w-full">
          Restart
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Are you absolutely sure?
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone.
            <br />
            It will permanently delete your scores.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <div className="grid grid-flow-col gap-2">
            <Button onClick={handleCloseMenu} variant="secondary">
              Cancel
            </Button>
            <Button
              onClick={(e) => {
                onClick(e);
                handleCloseMenu(e);
              }}
              variant="destructive"
            >
              Restart
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default RestartButton;
