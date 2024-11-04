import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders login page by default", () => {
  render(<App />);

  // Check for the heading and form fields in the login page
  const loginHeading = screen.getByRole("heading", { name: /login/i });
  expect(loginHeading).toBeInTheDocument();

  // Check for email and password input fields
  expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
});
