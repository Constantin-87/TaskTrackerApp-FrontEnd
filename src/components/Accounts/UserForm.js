import React, { useState, useEffect } from "react";
import axios from "axios";
import ErrorMessage from "../Shared/ErrorMessage";

const UserForm = ({
  user = {},
  onSubmit,
  isEditMode = false,
  isAdmin = false,
}) => {
  const [firstName, setFirstName] = useState(user.first_name || "");
  const [lastName, setLastName] = useState(user.last_name || "");
  const [email, setEmail] = useState(user.email || "");
  const [role, setRole] = useState(user.role || "agent"); // Default to agent for regular users
  const [roles, setRoles] = useState([]);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const baseUrl = `${process.env.REACT_APP_BASE_URL}:${process.env.REACT_APP_API_PORT}`;

  // Only pre-fill form fields if in edit mode and `user` data is available
  useEffect(() => {
    if (isEditMode) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setEmail(user.email || "");
      setRole(user.role || "");
    }
  }, [user, isEditMode]);

  // Fetch roles once when the component mounts, only if the user is an admin
  useEffect(() => {
    if (isAdmin && roles.length === 0) {
      const fetchRoles = async () => {
        const token = sessionStorage.getItem("authToken");
        try {
          const response = await axios.get(`${baseUrl}/api/users`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          });
          setRoles(response.data.roles);
        } catch (error) {
          console.error("Error fetching roles:", error);
        }
      };
      fetchRoles();
    }
  }, [baseUrl, isAdmin, roles.length]);

  const validateInputs = () => {
    // Reset any previous errors
    setError("");

    // First Name validation: required and minimum 2 characters
    if (!firstName.trim() || firstName.length < 2) {
      setError("First name is required and should be at least 2 characters.");
      return false;
    }

    // Last Name validation: required and minimum 2 characters
    if (!lastName.trim() || lastName.length < 2) {
      setError("Last name is required and should be at least 2 characters.");
      return false;
    }

    // Email validation: required and valid format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }

    // Password validation (only if creating or updating password)
    if (!isEditMode && newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }

    // Password confirmation match check
    if (newPassword && newPassword !== passwordConfirmation) {
      setError("New password and confirmation do not match.");
      return false;
    }

    // Current Password check if editing
    if (isEditMode && !isAdmin && newPassword && !currentPassword) {
      setError("Current password is required to update the password.");
      return false;
    }

    // If all validations pass
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate inputs and stop if validation fails
    if (!validateInputs()) return;

    // Prepare form data
    const formData = {
      first_name: firstName,
      last_name: lastName,
      email,
    };

    // Only include password and password confirmation if creating a new user or updating the password
    if (!isEditMode || newPassword) {
      formData.password = newPassword;
      formData.password_confirmation = passwordConfirmation;
    }

    // Include current password if in edit mode and updating password
    if (isEditMode && currentPassword && !isAdmin) {
      formData.current_password = currentPassword;
    }

    // Allow admin to assign roles
    if (isAdmin) formData.role = role;

    onSubmit(formData).catch((error) => {
      setError(error.message || "An error occurred while submitting the form.");
    });
  };
  return (
    <div className="bg-dark text-light p-4 rounded shadow">
      <h2 className="text-center mb-4">
        {isEditMode
          ? `Edit User - ${user.first_name || ""} ${user.last_name || ""}`
          : isAdmin
            ? "Add User"
            : "Sign Up"}
      </h2>

      {/* Display ErrorMessage component with any error text */}
      {error && <ErrorMessage message={error} />}

      <form onSubmit={handleSubmit}>
        <div className="form-group mb-3">
          <label className="form-label">First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="form-control bg-secondary text-light"
            autoComplete="given-name"
          />
        </div>

        <div className="form-group mb-3">
          <label className="form-label">Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="form-control bg-secondary text-light"
            autoComplete="family-name"
          />
        </div>

        <div className="form-group mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-control bg-secondary text-light"
            autoComplete="email"
          />
        </div>

        <div className="form-group mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="form-control bg-secondary text-light"
            placeholder="Enter password"
            autoComplete="new-password"
          />
          {!isEditMode && <em>6 characters minimum</em>}
        </div>

        <div className="form-group mb-3">
          <label className="form-label">Password Confirmation</label>
          <input
            type="password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            className="form-control bg-secondary text-light"
            placeholder="Confirm password"
            autoComplete="new-password"
          />
        </div>

        {isEditMode && !isAdmin && (
          <div className="form-group mb-3">
            <label className="form-label">Old Password</label>
            <input
              type="password"
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="form-control bg-secondary text-light"
              placeholder="Enter old password"
              autoComplete="new-password"
            />
          </div>
        )}

        {isAdmin && (
          <div className="form-group mb-3">
            <label className="form-label">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="form-control bg-secondary text-light"
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </div>
        )}

        <button type="submit" className="btn btn-primary">
          {isEditMode ? "Update User" : isAdmin ? "Add User" : "Sign Up"}
        </button>
      </form>
    </div>
  );
};

export default UserForm;
