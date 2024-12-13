import { render, screen } from "@testing-library/react";
import Page from "@/app/page";

test("renders learn react link", () => {
  render(<Page />);
  const titleElement = screen.getByText("Cricket Scoring Made Easy");
  expect(titleElement).toBeInTheDocument();
});
