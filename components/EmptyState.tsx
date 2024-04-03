import { FileSearch } from "lucide-react";

interface EmptyStateProps {
  document: string;
}

function EmptyState({ document }: EmptyStateProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full bg-muted shadow-sm">
        <FileSearch className="h-10 w-10" />
      </div>
      <div>
        <h2 className="pb-1 text-center text-base font-semibold leading-relaxed">
          There’s no {document} in your list
        </h2>
        <p className="pb-4 text-center text-sm font-normal leading-snug">
          Start creating {document} <br />
          to see list
        </p>
      </div>
    </div>
  );
}

export default EmptyState;
