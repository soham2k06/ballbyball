import { signIn } from "next-auth/react";
import { Button } from "./ui/button";
import GoogleIcon from "./google-icon";

function GoogleButton() {
  return (
    <Button className="gap-2" onClick={() => signIn("google")}>
      <GoogleIcon />
      Sign in
    </Button>
  );
}

export default GoogleButton;
