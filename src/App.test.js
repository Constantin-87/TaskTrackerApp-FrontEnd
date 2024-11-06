import { render, screen } from "@testing-library/react";
import App from "./App";

// Mock the getAccessToken function to prevent actual token checks in tests
jest.mock("./components/Accounts/Auth", () => ({
  ...jest.requireActual("./components/Accounts/Auth"),
  getAccessToken: jest.fn().mockResolvedValue("fake_access_token"),
}));

test("renders login page by default", () => {
  render(<App />);

  // Check for the heading and form fields in the login page
  const loginHeading = screen.getByRole("heading", { name: /login/i });
  expect(loginHeading).toBeInTheDocument();

  // Check for email and password input fields
  expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
});
