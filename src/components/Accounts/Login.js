import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = ({ loginUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Login attempt for user:", email);
    try {
      await loginUser(email, password);
      console.log("Login successful for user:", email);
    } catch (err) {
      setError("Invalid login credentials");
    }
  };

  const handleSignUp = () => {
    // Redirect to CreateAccount page (state set to indicate it's from the login page)
    navigate("/signup", { state: { fromAdminPage: false } });
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password</label>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>

      {/* Add a Sign Up button */}
      <button onClick={handleSignUp}>Sign Up</button>
    </div>
  );
};

export default Login;
