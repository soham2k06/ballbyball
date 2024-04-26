import HomePage from "@/app/(root)/page";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

describe("Page", () => {
  it("renders a heading", () => {
    render(<HomePage />);

    const heading = screen.getByRole("heading", {
      name: /Cricket Scoring Made Easy/i,
    });

    expect(heading).toBeInTheDocument();
  });
});
