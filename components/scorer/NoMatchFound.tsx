import Link from "next/link";
import { Button } from "../ui/button";
import { FileSearch } from "lucide-react";

function NoMatchFound() {
  return (
    <div className="flex items-center justify-center py-4 md:p-8">
      <div className="flex flex-col gap-4">
        <div className="mx-auto inline-flex size-20 items-center justify-center rounded-full bg-muted shadow-sm">
          <FileSearch className="size-10" />
        </div>
        <div>
          <h2 className="pb-1 text-center text-base font-semibold leading-relaxed">
            Match not found
          </h2>
          <p className="pb-4 text-center text-sm font-normal leading-snug text-muted-foreground">
            Try searching for another match
          </p>
        </div>
        <Button asChild>
          <Link href="/matches">Back to matches</Link>
        </Button>
      </div>
    </div>
  );
}

export default NoMatchFound;
