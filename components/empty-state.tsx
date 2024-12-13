import Image from "next/image";

interface EmptyStateProps {
  document: string;
}

function EmptyState({ document }: EmptyStateProps) {
  return (
    <div className="bg-mted mb-4 flex w-full flex-col justify-center gap-4 rounded-md">
      <div className="mx-auto inline-flex size-56 items-center justify-center rounded-md p-4">
        <Image src="/error-404.png" alt="Empty" width={400} height={400} />
      </div>
      <div>
        <h2 className="pb-1 text-center text-base font-semibold leading-relaxed text-muted-foreground">
          There’s no {document} in your list
        </h2>
      </div>
    </div>
  );
}

export default EmptyState;
