import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import UserForm from "./UserForm";
import ErrorMessage from "../Shared/ErrorMessage";
import FlashMessage from "../Shared/FlashMessage";
import { getCurrentUser, getAccessToken } from "./Auth";

const CreateAccount = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const ACCESS_TOKEN_KEY = "access_token";
  const REFRESH_TOKEN_KEY = "refresh_token";
  const CURRENT_USER_KEY = "currentUser";

  // Determine whether the page was accessed from the AdminPage or LoginPage
  const fromAdminPage = location.state?.fromAdminPage || false;
  const isAdmin = getCurrentUser()?.role === "admin";

  const handleCreateUser = async (formData) => {
    try {
      // Define headers and include token only if isAdmin is true and token is available
      const headers = isAdmin
        ? { Authorization: `Bearer ${getAccessToken()}` }
        : {};

      console.log("Form Data being sent:", formData); // Log form data

      const response = await axios.post(
        `/api/users/tokens/sign_up`,
        { user: formData },
        { headers }
      );

      if (response.status === 201) {
        setShowSuccessMessage(true); // Show success message on account creation

        // After 3 seconds, navigate based on where the user came from
        setTimeout(() => {
          if (fromAdminPage) {
            // Redirect back to the AdminPage if accessed from there
            navigate("/admin");
          } else {
            // Extract token and create user object with the expected structure
            if (
              response.data &&
              response.data.token &&
              response.data.refresh_token &&
              response.data.resource_owner
            ) {
              const { token, refresh_token } = response.data;
              const user = {
                ...response.data.resource_owner,
                role: response.data.role,
              };

              console.log("Token:", token, "User:", user); // Log token and formatted user

              // Store tokens and user information
              localStorage.setItem(ACCESS_TOKEN_KEY, token);
              localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
              localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
            } else {
              throw new Error("Invalid JSON response from server");
            }
            // Redirect to HomePage after successful signup and authentication
            navigate("/home");
          }
        }, 3000);
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
