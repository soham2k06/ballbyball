import Link from "next/link";

import { CaretSortIcon } from "@radix-ui/react-icons";

import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

function LoadingSelect({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full">
      <Label>{label}</Label>
      <Button
        className="w-full justify-between whitespace-nowrap rounded-md border border-input bg-muted px-3 text-muted-foreground"
        disabled
      >
        <span>{children}</span>
        <CaretSortIcon className="h-4 w-4 opacity-50" />
      </Button>
    </div>
  );
}

function loading() {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight max-sm:text-xl">
            Rivalries
          </h1>
          <p className="text-sm text-muted-foreground">
            Select player or batsman/bowler to see their head-to-head stats.
          </p>
        </div>
        <Link
          href="/rivalries"
          className={buttonVariants({
            size: "sm",
          })}
        >
          Show All
        </Link>
      </div>
      <div className="p-1">
        <div className="mb-4 grid grid-cols-1 gap-1 sm:grid-cols-[1fr_2fr] sm:gap-4">
          <LoadingSelect label="Player">Select a player</LoadingSelect>
          <div className="flex w-full items-end gap-1 sm:grid sm:grid-cols-[3fr_3fr_1fr] sm:gap-4">
            <LoadingSelect label="Batsman">Select</LoadingSelect>
            <LoadingSelect label="Bowler">Select</LoadingSelect>
            <Button disabled>Swap</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default loading;
