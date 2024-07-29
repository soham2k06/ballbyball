import { Loader2 } from "lucide-react";

function loading() {
  return (
    <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center">
      <Loader2 className="animate-spin" />
    </div>
  );
}

export default loading;
