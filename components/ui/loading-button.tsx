import { Loader } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button, ButtonProps } from "./button";

type LoadingButtonProps = {
  loading: boolean;
} & ButtonProps;

function LoadingButton({ children, loading, ...props }: LoadingButtonProps) {
  return (
    <Button
      {...props}
      disabled={props.disabled || loading}
      className={cn("gap-2", props.className)}
    >
      {loading && <Loader className="h-4 w-4 animate-spin" />} {children}
    </Button>
  );
}

export default LoadingButton;
