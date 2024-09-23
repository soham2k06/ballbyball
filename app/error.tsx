"use client";

import { useState } from "react";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [errCopied, setErrCopied] = useState(false);

  const copyError = () => {
    navigator.clipboard.writeText(
      error.message + " " + error.stack + " " + error.digest,
    );
    setErrCopied(true);
    setTimeout(() => setErrCopied(false), 2000);
  };

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-7xl items-center justify-center p-4">
      <Card className="w-full p-8">
        <CardHeader className="mb-6 border-b pb-4">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
            Oops! Something went wrong.
          </h1>
          <p className="text-muted-foreground md:text-xl">
            Error: {error.message}
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-16">
            <div>
              <p className="text-lg font-medium">
                It really happens once in a decade! But,
              </p>
              <h3 className="mb-6 text-lg font-medium">
                What you can do from here?
              </h3>
              <ul className="mb-4 list-disc space-y-1 pl-6 opacity-80">
                <li>Make sure you are online with the stable network</li>
                <li>Try again or reload the page</li>
              </ul>
              <Button onClick={copyError} size="sm">
                {errCopied ? "Copied" : "Copy error"}
              </Button>
              <br />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 sm:flex-row">
          <Button size="lg" onClick={reset}>
            Try again
          </Button>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/">Go to Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
