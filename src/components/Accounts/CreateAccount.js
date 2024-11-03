import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import UserForm from "./UserForm";
import ErrorMessage from "../Shared/ErrorMessage";
import FlashMessage from "../Shared/FlashMessage";

const CreateAccount = ({ isAdmin, setIsAuthenticated, setCurrentUser }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Determine whether the page was accessed from the AdminPage or LoginPage
  const fromAdminPage = location.state?.fromAdminPage || false;

  const handleCreateUser = async (formData) => {
    try {
      let headers = {};

      // Include JWT token in headers if the current user is an admin
      if (isAdmin) {
        const token = sessionStorage.getItem("authToken");
        headers = {
          Authorization: `Bearer ${token}`,
        };
      }

      const response = await axios.post(
        `/api/users`,
        { user: formData },
        {
          headers: headers,
          withCredentials: true,
        }
      );

      if (response.status === 201) {
        setShowSuccessMessage(true); // Show success message on account creation

        // After 3 seconds, navigate based on where the user came from
        setTimeout(() => {
          if (fromAdminPage) {
            // Redirect back to the AdminPage if accessed from there
            navigate("/admin");
          } else {
            const { token, user } = response.data;
            sessionStorage.setItem("authToken", token);
            sessionStorage.setItem("currentUser", JSON.stringify(user));

            setIsAuthenticated(true);
            setCurrentUser(user);

            // Redirect to HomePage after successful signup and authentication
            navigate("/home");
          }
        }, 3000);
      }
    } catch (error) {
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
