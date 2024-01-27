import Image from "next/image";
import DarkModeToggle from "./DarkModeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

function Footer() {
  return (
    <div className="text-muted-foreground border-t mt-4 text-sm p-2 md:fixed w-full md:bottom-0">
      <div className="max-w-7xl mx-auto flex justify-between w-full items-center">
        <div className="flex gap-2 items-center">
          <h2 className="text-xl tracking-tight font-bold">BallByBall.</h2>
          <ul className="flex gap-4">
            <a href="https://github.com/rudrabhikadiya3">
              <Avatar>
                <AvatarImage src="/rudra.png" alt="@shadcn" />
                <AvatarFallback>RB</AvatarFallback>
              </Avatar>
            </a>
            <a href="https://github.com/soham2k06">
              <Avatar>
                <AvatarImage src="/soham.jpg" alt="@shadcn" />
                <AvatarFallback>SB</AvatarFallback>
              </Avatar>
            </a>
          </ul>
        </div>
        <DarkModeToggle />
      </div>
    </div>
  );
}

export default Footer;
