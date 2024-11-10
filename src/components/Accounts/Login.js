import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

const Login = ({ loginUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errorMessage = await loginUser(email, password);
    if (errorMessage) {
      setError(errorMessage);
    } else {
      navigate("/home");
    }
  };

  const handleSignUp = () => {
    // Redirect to CreateAccount page
    navigate("/signup");
  };
  return (
    <div
      className="d-flex justify-content-center align-items-center min-vh-100"
      style={{
        paddingTop: "50px",
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
      }}
    >
      <div
        className="bg-dark text-light p-4 rounded shadow"
        style={{ width: "600px" }}
      >
        {/* Flex container for logo and heading */}
        <div className="d-flex align-items-center mb-4">
          <img
            src={logo}
            alt="TaskTracker Logo"
            style={{ width: "50px", marginRight: "15px" }}
          />
          <h2 className="display-5 text-left text-light mb-0">Login</h2>
        </div>

        {error && (
          <div className="alert alert-danger text-center mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control bg-secondary text-light"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control bg-secondary text-light"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 mb-3">
            Login
          </button>
        </form>

        <button onClick={handleSignUp} className="btn btn-secondary w-100">
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default Login;
