import React, { ReactNode } from "react";

import { cn } from "@/lib/utils";

type TypographyProps = {
  children: ReactNode;
} & React.HTMLAttributes<HTMLParagraphElement>;

function TypographyH1({ children, ...props }: TypographyProps) {
  const { className, ...restProps } = props;
  return (
    <h1
      className={cn(
        "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
        className,
      )}
      {...restProps}
    >
      {children}
    </h1>
  );
}

function TypographyH2({ children, ...props }: TypographyProps) {
  const { className, ...restProps } = props;
  return (
    <h2
      className={cn(
        "scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0",
        className,
      )}
      {...restProps}
    >
      {children}
    </h2>
  );
}

function TypographyH3({ children, ...props }: TypographyProps) {
  const { className, ...restProps } = props;
  return (
    <h3
      className={cn(
        "scroll-m-20 text-2xl font-semibold tracking-tight",
        className,
      )}
      {...restProps}
    >
      {children}
    </h3>
  );
}

function TypographyH4({ children, ...props }: TypographyProps) {
  const { className, ...restProps } = props;
  return (
    <h4
      className={cn(
        "scroll-m-20 text-xl font-semibold tracking-tight",
        className,
      )}
      {...restProps}
    >
      {children}
    </h4>
  );
}

function TypographyP({ children, ...props }: TypographyProps) {
  const { className, ...restProps } = props;
  return (
    <p
      className={cn("leading-7 [&:not(:first-child)]:mt-6", className)}
      {...restProps}
    >
      {children}
    </p>
  );
}

export { TypographyH1, TypographyH2, TypographyH3, TypographyH4, TypographyP };
