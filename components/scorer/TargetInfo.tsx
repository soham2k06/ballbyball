import { cn, processTeamName } from "@/lib/utils";
import { useEffect, useState } from "react";

interface TargetInfoProps {
  target: number;
  ballsRemaining: number;
  runs: number;
  curTeam: string | undefined;
}

function TargetInfo({
  ballsRemaining,
  target,
  runs,
  curTeam,
}: TargetInfoProps) {
  const [showTarget, setShowTarget] = useState(false);

  const remainingRuns = target - runs;

  const rrr = Math.round((remainingRuns / ballsRemaining) * 6 * 10) / 10;

  const toggleContent = () => setShowTarget(!showTarget);

  //   useEffect(() => {
  //     const intervalId = setInterval(toggleContent, 3000);

  //     return () => clearInterval(intervalId);
  //   }, []);

  useEffect(() => {
    const TOGGLE_INTERVAL = 15000;
    const intervalId = setInterval(() => {
      setShowTarget((prevShowTarget) => !prevShowTarget);
    }, TOGGLE_INTERVAL);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="relative">
      <div
        onClick={toggleContent}
        className={cn(
          "cursor-pointer text-center text-sm font-semibold text-muted-foreground transition-opacity duration-500",
          {
            "opacity-0": !showTarget,
          },
        )}
      >
        {processTeamName(curTeam ?? "")} need {remainingRuns} in{" "}
        {ballsRemaining} balls to win
      </div>
      <div
        onClick={toggleContent}
        className={cn(
          "absolute left-1/2 top-0 -translate-x-1/2 cursor-pointer text-center text-sm font-semibold text-muted-foreground transition-opacity duration-500",
          {
            "opacity-0": showTarget,
          },
        )}
      >
        Target: {target} | RRR: {rrr}
      </div>
    </div>
  );
}

export default TargetInfo;
