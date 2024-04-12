import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import DarkModeToggle from "./DarkModeToggle";

function Footer() {
  return (
    <div className="sticky bottom-0 mt-4 w-full border-t bg-card/75 p-2 text-sm text-muted-foreground backdrop-blur-lg">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
        <ul className="flex gap-4">
          <a href="https://github.com/rudrabhikadiya3">
            <Avatar>
              <AvatarImage src="/rudra.png" alt="rudra" />
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

        <h2 className="text-xl font-semibold tracking-tight">
          &copy; BallByBall.
        </h2>
        <DarkModeToggle />
      </div>
    </div>
  );
}

export default Footer;
