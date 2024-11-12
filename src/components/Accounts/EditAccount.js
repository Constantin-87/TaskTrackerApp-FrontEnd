import React, { useEffect, useState } from "react";
import UserForm from "./UserForm";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ErrorMessage from "../Shared/ErrorMessage";
import FlashMessage from "../Shared/FlashMessage";
import { getAccessToken, updateCurrentUser, getCurrentUser } from "./Auth";

const EditAccount = ({ currentUser, setCurrentUser }) => {
  const [user, setUser] = useState({});
  const { id } = useParams(); // Get the user ID from the URL
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const fromAdminPage = location.state?.fromAdminPage || false;

  useEffect(() => {
    // Check if the user has permission to edit the account
    if (parseInt(id, 10) !== currentUser.id && currentUser.role !== "admin") {
      navigate("/home");
      return;
    }

    // Fetch user data using the ID from the URL
    const fetchUserData = async () => {
      try {
        const token = await getAccessToken();

        if (!token) {
          setError("Authorization token missing.");
          return;
        }

        const response = await axios.get(`/api/users/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
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
    const token = await getAccessToken();
    try {
      const response = await axios.put(
        `/api/users/${id}`,
        {
          user: formData,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setShowSuccessMessage(true);
        setTimeout(() => {
          if (parseInt(id, 10) === currentUser.id) {
            const { role, first_name, last_name } = response.data.user;
            const updatedUser = {
              ...currentUser,
              firstName: first_name,
              lastName: last_name,
              role,
            };
            updateCurrentUser(updatedUser);
            setCurrentUser(updatedUser);
            navigate("/home");
          } else if (fromAdminPage) {
            navigate("/admin");
          }
        }, 2000);
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
        isCurrentUser={parseInt(id, 10) === currentUser.id}
      />
    </div>
  );
};

export default EditAccount;
