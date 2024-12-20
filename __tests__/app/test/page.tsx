import TestPage from "@/app/test/page";
import { fireEvent, render, screen } from "@testing-library/react";

// test("Testing Input box", () => {
//   render(<TestPage />);
//   const input = screen.getByRole("textbox") as HTMLInputElement;

//   expect(input).toBeInTheDocument();
//   fireEvent.change(input, { target: { value: "Hello" } });
//   expect(input.value).toBe("Hello");
// });

// test("Testing Dark mode button click", () => {
//   render(<TestPage />);
//   const button = screen.getByRole("button") as HTMLButtonElement;
//   const mode = screen.getByText(/Mode:/i);

//   // check if button and mode are present
//   expect(button).toBeInTheDocument();

//   // click the button, so the mode should change
//   fireEvent.click(button);

//   // check if the mode is changed, because it was light before
//   expect(mode).toHaveTextContent("dark");
// });

test("Testing Test page", () => {
  const page = render(<TestPage />);

  expect(page).toMatchSnapshot();
});
