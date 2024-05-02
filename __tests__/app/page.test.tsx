import { render, screen } from "@testing-library/react";
import TestPage from "@/app/(root)/test/page";

test("renders a heading", () => {
  render(<TestPage />);
  const heading = screen.getByText(/jest test cases/i);
  expect(heading).toBeInTheDocument();
});

test("renders an image", () => {
  render(<TestPage />);
  const image = screen.getByTitle(/jest test cases/i);
  expect(image).toBeInTheDocument();
});

test("renders a textbox", () => {
  render(<TestPage />);
  const textbox = screen.getByRole("textbox");
  const textboxPlaceholder = screen.getByPlaceholderText("enter your name");
  expect(textbox).toBeInTheDocument();
  expect(textboxPlaceholder).toBeInTheDocument();
  expect(textbox).toHaveAttribute("type", "text");
  expect(textbox).toHaveAttribute("name", "name");
  expect(textbox).toHaveAttribute("id", "name");
  expect(textbox).toHaveAttribute("value", "soham");
});
