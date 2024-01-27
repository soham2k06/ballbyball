import { MoreVertical } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import RestartButton from "../RestartButton";
import { useState } from "react";

function DangerActions({
  handleRestart,
  handleUndo,
}: {
  handleRestart: () => void;
  handleUndo: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  return (
    <DropdownMenu open={showMenu} onOpenChange={() => setShowMenu(!showMenu)}>
      <DropdownMenuTrigger asChild>
        <Button
          className="absolute right-2 top-2"
          size="icon"
          variant="outline"
        >
          <MoreVertical size={20} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40 p-4 space-y-2" align="end">
        <RestartButton
          onClick={() => {
            handleRestart();
            setShowMenu(false);
          }}
        />
        <Button
          size="sm"
          variant="destructive"
          className="w-full"
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
