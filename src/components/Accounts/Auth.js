import axios from "axios";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const CURRENT_USER_KEY = "currentUser";

// Login function
export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(
      `/api/users/tokens/sign_in`,
      { email, password },
      { headers: { "Content-Type": "application/json" } }
    );

    // Extract token and create user object
    if (
      response.data &&
      response.data.token &&
      response.data.refresh_token &&
      response.data.resource_owner
    ) {
      const { token, refresh_token, expires_in, role, first_name, last_name } =
        response.data;
      const expirationTime = Date.now() + expires_in * 1000; // Calculate expiration time in ms

      const user = {
        ...response.data.resource_owner,
        role: role,
        firstName: first_name,
        lastName: last_name,
      };

      // Store tokens, expiration, and user information
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
      localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      localStorage.setItem("expiration_time", expirationTime);
    } else {
      throw new Error("Invalid JSON response from server");
    }
  } catch (error) {
    console.error("Login failed:", error);
    throw new Error("Invalid login credentials");
  }
};

// Refresh token function
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) throw new Error("No refresh token available");

  try {
    const response = await axios.post(
      `/api/users/tokens/refresh`,
      { refresh_token: refreshToken },
      { headers: { "Content-Type": "application/json" } }
    );

    const { token, expires_in } = response.data;
    const newExpirationTime = Date.now() + expires_in * 1000;

    localStorage.setItem("access_token", token);
    localStorage.setItem("expiration_time", newExpirationTime); // Update expiration time
    return token;
  } catch (error) {
    console.error("Token refresh failed:", error);
    logoutUser(); // Logout if refresh fails
    throw new Error("Session expired. Please log in again.");
  }
};

// Helper function to get the access token, refreshing it if needed
export const getAccessToken = async () => {
  if (isTokenExpired()) {
    return await refreshAccessToken();
  }

  return localStorage.getItem("access_token");
};

export const updateCurrentUser = (user) => {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};

// Check if the token is expired based on the expiration time
const isTokenExpired = () => {
  const expirationTime = localStorage.getItem("expiration_time");
  if (!expirationTime) return true;

  return Date.now() >= parseInt(expirationTime, 10);
};

// Logout function
export const logoutUser = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
};

// Check if the user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem(REFRESH_TOKEN_KEY);
};

// Get the current user
export const getCurrentUser = () => {
  const user = localStorage.getItem(CURRENT_USER_KEY);
  return user ? JSON.parse(user) : null;
};
