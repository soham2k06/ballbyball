import DarkModeToggle from "./DarkModeToggle";

function Nav() {
  return (
    <div className="flex items-center justify-between max-w-7xl mx-auto p-4">
      <h2>Scorer</h2>
      <DarkModeToggle />
    </div>
  );
}

export default Nav;
