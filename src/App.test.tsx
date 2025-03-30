import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import App from "./App";

test("renders without crashing", () => {
  render(<App />);
  expect(screen.getByText(/Vite \+ React/i)).toBeInTheDocument();
});

test("displays the Vite and React logos", () => {
  render(<App />);
  const viteLogo = screen.getByAltText(/Vite logo/i);
  const reactLogo = screen.getByAltText(/React logo/i);

  expect(viteLogo).toBeInTheDocument();
  expect(reactLogo).toBeInTheDocument();
});

test("increments count when button is clicked", async () => {
  // userEvent setup
  const user = userEvent.setup();

  render(<App />);
  const button = screen.getByRole("button", { name: /count is 0/i });

  expect(button).toBeInTheDocument();

  // Use userEvent instead of fireEvent
  await user.click(button);
  expect(
    screen.getByRole("button", { name: /count is 1/i })
  ).toBeInTheDocument();

  await user.click(button);
  expect(
    screen.getByRole("button", { name: /count is 2/i })
  ).toBeInTheDocument();
});

test("displays correct static text", () => {
  render(<App />);
  expect(screen.getByText(/Edit/i)).toBeInTheDocument();
  expect(screen.getByText(/src\/App\.tsx/i)).toBeInTheDocument();
  expect(
    screen.getByText(/Click on the Vite and React logos to learn more/i)
  ).toBeInTheDocument();
});
