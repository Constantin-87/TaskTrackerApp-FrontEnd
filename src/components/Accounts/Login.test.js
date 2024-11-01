import { render, screen, fireEvent, act } from "@testing-library/react";
import Login from "./Login";
import { BrowserRouter } from "react-router-dom";

const mockLoginUser = jest.fn();

describe("Login Component", () => {
  const setup = () =>
    render(
      <BrowserRouter>
        <Login loginUser={mockLoginUser} />
      </BrowserRouter>
    );

  test("renders Login heading", () => {
    setup();
    expect(screen.getByRole("heading", { name: /login/i })).toBeInTheDocument();
  });

  test("renders email and password input fields", () => {
    setup();
    // Use getByRole to specifically target the email and password input fields
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
  });

  test("renders Login and Sign Up buttons", () => {
    setup();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign up/i })
    ).toBeInTheDocument();
  });

  test("calls loginUser function on form submission", async () => {
    setup();
    const emailInput = screen.getByPlaceholderText("Email");
    const passwordInput = screen.getByPlaceholderText("Password");
    const loginButton = screen.getByRole("button", { name: /login/i });

    // Use await act to wrap asynchronous interactions
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.click(loginButton);
    });

    // Check if mockLoginUser function was called with correct arguments
    expect(mockLoginUser).toHaveBeenCalledWith(
      "test@example.com",
      "password123"
    );
  });
});