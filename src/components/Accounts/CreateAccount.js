import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import UserForm from "./UserForm";
import ErrorMessage from "../Shared/ErrorMessage";
import FlashMessage from "../Shared/FlashMessage";
import {
  getCurrentUser,
  getAccessToken,
  loginUser,
  isAuthenticated,
} from "./Auth";

const CreateAccount = ({ setCurrentUser }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Determine whether the page was accessed from the AdminPage or LoginPage
  const fromAdminPage = location.state?.fromAdminPage || false;
  const userAuthenticated = isAuthenticated();
  const isAdmin = getCurrentUser()?.role === "admin";

  const handleCreateUser = async (formData) => {
    try {
      // 1. If navigated from the Login page and the user is not authenticated, use the sign_up route.
      // 2. Otherwise, use the users endpoint to create a new user or edit a user.
      const endpoint =
        fromAdminPage && userAuthenticated
          ? "/api/users"
          : "/api/users/tokens/sign_up";

      const headers = userAuthenticated
        ? { Authorization: `Bearer ${await getAccessToken()}` }
        : {};

      const response = await axios.post(
        endpoint,
        { user: formData },
        { headers }
      );

      if (response.status === 201) {
        setShowSuccessMessage(true);

        // After 2 seconds, navigate based on where the user came from
        setTimeout(async () => {
          if (fromAdminPage) {
            // Redirect back to the AdminPage if accessed from there
            navigate("/admin");
          } else {
            try {
              await loginUser(formData.email, formData.password);

              // Manually update the current user in the App component
              const loggedInUser = getCurrentUser();
              setCurrentUser(loggedInUser);
              if (loggedInUser) {
                navigate("/home");
              } else {
                setError("Authentication failed after account creation.");
              }
            } catch (err) {
              console.error("Login failed after account creation:", err);
              setError("Failed to authenticate new user.");
            }
          }
        }, 2000);
      }
    } catch (error) {
      console.error("Error in CreateAccount:", error.response);
      const errorMessage =
        error.response?.data?.errors?.join("\n") || "Failed to create user.";
      setError(errorMessage);
    }
  };

  return (
    <>
      {/* Display FlashMessage on successful account creation */}
      {showSuccessMessage && (
        <FlashMessage message="Account created successfully!" />
      )}

      {/* Display any error message */}
      {error && <ErrorMessage message={error} />}

      <UserForm
        onSubmit={handleCreateUser}
        isEditMode={false}
        isAdmin={isAdmin}
      />
    </>
  );
};

export default CreateAccount;
