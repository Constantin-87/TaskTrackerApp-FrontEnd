// src/components/Accounts/Auth.js

import axios from "axios";

// Login function
export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(
      `/api/users/tokens/sign_in`,
      { email, password },
      { headers: { "Content-Type": "application/json" } }
    );

    console.log("Login response:", response.data);

    // Extract token and create user object with the expected structure
    if (response.data && response.data.token && response.data.resource_owner) {
      const { token } = response.data;
      const user = {
        ...response.data.resource_owner,
        role: response.data.role,
      };

      console.log("Token:", token, "User:", user); // Log token and formatted user

      // Store token and formatted user object
      localStorage.setItem("refresh_token", token);
      localStorage.setItem("currentUser", JSON.stringify(user));
    } else {
      throw new Error("Invalid JSON response from server");
    }
  } catch (error) {
    console.error("Login failed:", error);
    throw new Error("Invalid login credentials");
  }
};

// Logout function
export const logoutUser = async () => {
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("currentUser");
};

// Check if the user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem("refresh_token");
};

// Get the current user
export const getCurrentUser = () => {
  const user = localStorage.getItem("currentUser");
  console.log("Retrieved user from localStorage:", user);
  return user ? JSON.parse(user) : null;
};
