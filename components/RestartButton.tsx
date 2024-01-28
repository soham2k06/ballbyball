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
        <div className="gap-4 grid m-2 rounded-md border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default RestartButton;
