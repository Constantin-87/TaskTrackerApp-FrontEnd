import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import FlashMessage from "../Shared/FlashMessage";
import ErrorMessage from "../Shared/ErrorMessage";
import { getAccessToken } from "../../components/Accounts/Auth";

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Reset the success message after 3 seconds
  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  useEffect(() => {
    // Fetch all users
    const fetchUsers = async () => {
      const token = await getAccessToken();
      try {
        const response = await axios.get(`/api/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(response.data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to fetch users.");
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
    navigate(`/users/${user.id}/edit`, { state: { fromAdminPage: true } });
  };

  const handleDeleteUser = async (userId, firstName, lastName) => {
    const token = await getAccessToken();
    if (
      window.confirm(
        "Are you sure you want to delete " + firstName + " " + lastName + "?"
      )
    ) {
      try {
        await axios.delete(`/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
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
      <h1 className="display-4 text-left text-light mb-4">User Management</h1>

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
                  style={{
                    height: "30px",
                    width: "50px",
                    padding: "0",
                    margin: "5px 0",
                  }}
                  onClick={() => handleEditButtonClick(user)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-outline-danger me-2"
                  style={{
                    height: "30px",
                    width: "55px",
                    padding: "0",
                    margin: "5px 0",
                  }}
                  onClick={() =>
                    handleDeleteUser(user.id, user.first_name, user.last_name)
                  }
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
