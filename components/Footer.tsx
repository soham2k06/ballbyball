import DarkModeToggle from "./DarkModeToggle";

function Footer() {
  return (
    <div className="text-muted-foreground border-t mt-4 text-sm p-2 md:fixed w-full md:bottom-0">
      <div className="max-w-7xl mx-auto flex justify-between w-full items-center">
        <p>
          Created by{" "}
          <a href="https://github.com/soham2k06" className="underline">
            Soham Bhikadiya
          </a>
          .
        </p>
        <DarkModeToggle />
      </div>
    </div>
  );
}

export default Footer;
