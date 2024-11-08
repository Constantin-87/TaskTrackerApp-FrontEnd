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
  console.log("From Admin Page:", fromAdminPage);
  const isAdmin = getCurrentUser()?.role === "admin";
  console.log("Is Admin:", isAdmin);

  const handleCreateUser = async (formData) => {
    try {
      // Determine the endpoint based on whether the request is from the AdminPage
      const endpoint = fromAdminPage
        ? "/api/users"
        : "/api/users/tokens/sign_up";

      // Define headers and include token only if isAdmin is true and token is available
      const headers = isAdmin
        ? { Authorization: `Bearer ${await getAccessToken()}` }
        : {};

      console.log("Form Data being sent:", formData); // Log form data

      const response = await axios.post(
        endpoint,
        { user: formData },
        { headers }
      );

      if (response.status === 201) {
        setShowSuccessMessage(true); // Show success message on account creation

        // After 3 seconds, navigate based on where the user came from
        setTimeout(() => {
          if (fromAdminPage) {
            console.log("Redirecting to AdminPage");
            // Redirect back to the AdminPage if accessed from there
            navigate("/admin");
          } else {
            console.log("Redirecting to HomePage after login");
            // Extract token and create user object with the expected structure
            if (
              response.data &&
              response.data.token &&
              response.data.refresh_token &&
              response.data.resource_owner
            ) {
              const {
                token,
                refresh_token,
                expires_in,
                role,
                first_name,
                last_name,
              } = response.data;
              const expirationTime = Date.now() + expires_in * 1000; // Calculate expiration time in ms

              const user = {
                ...response.data.resource_owner,
                role: role,
                firstName: first_name,
                lastName: last_name,
              };

              console.log("Token:", token, "User:", user); // Log token and formatted user

              // Store tokens and user information
              localStorage.setItem(ACCESS_TOKEN_KEY, token);
              localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);
              localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
              localStorage.setItem("expiration_time", expirationTime);
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
