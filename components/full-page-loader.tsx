import { Loader2 } from "lucide-react";

function FullPageLoader() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="size-16 animate-spin" />
    </div>
  );
}

export default FullPageLoader;
