import { Accessibility, AirVent } from "lucide-react";
import DarkModeToggle from "./DarkModeToggle";

function Nav() {
  return (
    <div className="flex items-center justify-between max-w-7xl mx-auto p-4 bg-primary-foreground">
      <h2 className="text-3xl flex items-center gap-2 font-semibold tracking-tight">
        <AirVent /> Scorer
      </h2>
      <DarkModeToggle />
    </div>
  );
}

export default Nav;
