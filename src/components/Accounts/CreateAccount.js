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
      // Define headers and include token only if isAdmin is true and token is available
      const headers =
        isAdmin && sessionStorage.getItem("authToken")
          ? { Authorization: `Bearer ${sessionStorage.getItem("authToken")}` }
          : {};

      console.log("Form Data being sent:", formData); // Log form data

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
            console.log("authToken", token);
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
