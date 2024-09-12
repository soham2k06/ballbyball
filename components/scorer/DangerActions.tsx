import { useState } from "react";
import { ChevronLeft, MoreVertical } from "lucide-react";

import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import RestartButton from "../RestartButton";
import Link from "next/link";

function DangerActions({
  handleRestart,
  handleUndo,
  backLink,
}: {
  handleRestart: () => void;
  handleUndo: () => void;
  backLink: string;
}) {
  const [showMenu, setShowMenu] = useState(false);
  return (
    <DropdownMenu open={showMenu} onOpenChange={() => setShowMenu(!showMenu)}>
      <DropdownMenuTrigger asChild>
        <Button
          name="danger-actions"
          title="danger-actions"
          size="icon"
          variant="secondary"
        >
          <MoreVertical size={20} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="grid w-40 gap-2 p-4" align="end">
        <Button size="sm" variant="outline" asChild>
          <Link href={backLink}>
            <ChevronLeft className="size-4" strokeWidth={1.5} />
            Back
          </Link>
        </Button>
        <RestartButton
          onClick={handleRestart}
          handleCloseMenu={() => setShowMenu(false)}
        />
        <Button
          size="sm"
          variant="destructive"
          onClick={() => {
            setShowMenu(false);
            handleUndo();
          }}
        >
          Undo
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default DangerActions;
