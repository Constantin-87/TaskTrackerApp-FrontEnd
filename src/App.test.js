import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders login page by default", () => {
  render(<App />);

  // Use getByRole to specify the heading element to avoid ambiguity with the button
  const loginHeading = screen.getByRole("heading", { name: /login/i });
  expect(loginHeading).toBeInTheDocument();

  // Check for email and password input fields
  expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
});
