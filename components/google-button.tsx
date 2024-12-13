"use client";

import { signIn } from "next-auth/react";

import GoogleIcon from "./google-icon";
import { Button } from "./ui/button";

function GoogleButton() {
  return (
    <Button
      className="gap-2"
      variant="outline"
      onClick={() => signIn("google")}
    >
      <GoogleIcon />
      Sign in
    </Button>
  );
}

export default GoogleButton;
