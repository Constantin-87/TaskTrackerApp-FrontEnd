import React, { useEffect, useState } from "react";
import UserForm from "./UserForm";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom"; // Import useParams to get the user ID
import ErrorMessage from "../Shared/ErrorMessage";
import FlashMessage from "../Shared/FlashMessage";
import { getAccessToken } from "./Auth";

const EditAccount = ({ currentUser }) => {
  const [user, setUser] = useState({});
  const { id } = useParams(); // Get the user ID from the URL
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    // Check if the user has permission to edit the account
    if (parseInt(id, 10) !== currentUser.id && currentUser.role !== "admin") {
      navigate("/home");
      return;
    }

    // Fetch user data using the ID from the URL
    const fetchUserData = async () => {
      try {
        const token = await getAccessToken(); // Retrieve token

        if (!token) {
          setError("Authorization token missing.");
          return;
        }

        const response = await axios.get(`/api/users/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`, // Pass the JWT token in the headers
          },
        });
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data.");
      }
    };

    fetchUserData();
  }, [id, currentUser, navigate]);

  const handleEdit = async (formData) => {
    const token = await getAccessToken(); // Retrieve token
    try {
      const response = await axios.put(
        `/api/users/${id}`,
        {
          user: formData,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Pass the JWT token in the headers
          },
        }
      );
      if (response.status === 200) {
        // Show a success message
        setShowSuccessMessage(true);

        // Redirect to the admin page after 3 seconds
        setTimeout(() => {
          window.location.href = "/admin";
        }, 3000);
      }
    } catch (error) {
      // Pass the error message to the UserForm component
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError("An error occurred while updating the user.");
      }
    }
  };

  return (
    <div>
      {showSuccessMessage && (
        <FlashMessage message="Account updated successfully!" />
      )}
      {error && <ErrorMessage message={error} />}
      <UserForm
        user={user}
        onSubmit={handleEdit}
        isEditMode={true}
        isAdmin={currentUser.role === "admin"}
      />
    </div>
  );
};

export default EditAccount;
