"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import StartMatchDialog from "./StartUpdateMatchDialog";

function StartMatchButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Start match</Button>

      <StartMatchDialog open={open} setOpen={setOpen} />
    </>
  );
}

export default StartMatchButton;
