import { OverlayStateProps } from "@/types";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface AlertNodeProps extends OverlayStateProps {
  onConfirm: () => void;
  content: string;
  isLoading?: boolean;
}

function AlertNote({
  open,
  setOpen,
  onConfirm,
  content,
  isLoading,
}: AlertNodeProps) {
  useEffect(() => {
    if (!isLoading) setOpen(false);
  }, [isLoading]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>{content}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button onClick={onConfirm} disabled={isLoading} className="min-w-32">
            {isLoading ? (
              <Loader2 className="size-5 animate-spin" strokeWidth={3} />
            ) : (
              "Yes, I'm sure"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default AlertNote;
