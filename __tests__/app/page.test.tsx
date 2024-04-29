import { render, screen } from "@testing-library/react";
import HomePage from "@/app/(root)/page";

describe("Page", () => {
  it("renders a heading", () => {
    render(<HomePage />);
    const heading = screen.getByTestId("banner-heading");
    expect(heading).toBeInTheDocument();
  });
});
