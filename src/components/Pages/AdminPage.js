import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import FlashMessage from "../Shared/FlashMessage";
import ErrorMessage from "../Shared/ErrorMessage";

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Add this useEffect to reset the success message after 3 seconds
  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => {
        setShowSuccessMessage(false); // Reset the success message after 3 seconds
      }, 3000);

      return () => clearTimeout(timer); // Cleanup the timer
    }
  }, [showSuccessMessage]);

  useEffect(() => {
    // Fetch all users
    const fetchUsers = async () => {
      const token = sessionStorage.getItem("authToken"); // Retrieve the token from sessionStorage
      try {
        const response = await axios.get("http://localhost:4000/api/users", {
          headers: {
            Authorization: `Bearer ${token}`, // Pass the JWT token in the headers
          },
          withCredentials: true, // Ensure credentials are sent with the request
        });
        setUsers(response.data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Error fetching users.");
        if (error.response && error.response.status === 401) {
          setError("Unauthorized access. Please log in again.");
        }
      }
    };
    fetchUsers();
  }, []);

  const handleCreateUser = () => {
    // Redirect to the CreateAccount page and indicate that it's being accessed from the Admin page
    navigate("/signup", { state: { fromAdminPage: true } });
  };

  const handleEditButtonClick = (user) => {
    // Navigate to the edit page with the user ID
    navigate(`/users/${user.id}/edit`);
  };

  const handleDeleteUser = async (userId) => {
    const token = sessionStorage.getItem("authToken");
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`http://localhost:4000/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`, // Pass the JWT token in the headers
          },
          withCredentials: true, // Ensure credentials are sent with the request
        });
        setUsers(users.filter((user) => user.id !== userId));
        setShowSuccessMessage(true);
      } catch (error) {
        console.error("Error deleting user:", error);
        setError("Failed to delete user.");
      }
    }
  };

  return (
    <div className="admin-page">
      <h1 className="display-4 text-center text-light mb-4">User Management</h1>

      {/* FlashMessage displayed on successful user deletion */}
      {showSuccessMessage && (
        <FlashMessage message="User deleted successfully!" />
      )}

      {/* ErrorMessage displayed when there’s an error */}
      {error && <ErrorMessage message={error} />}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <button className="btn btn-success" onClick={handleCreateUser}>
          Add New User
        </button>
      </div>

      <table className="table table-hover table-bordered table-dark">
        <thead className="thead-light">
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{`${user.first_name} ${user.last_name}`}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td className="text-center">
                <button
                  className="btn btn-outline-warning me-2"
                  onClick={() => handleEditButtonClick(user)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-outline-danger"
                  onClick={() => handleDeleteUser(user.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPage;
