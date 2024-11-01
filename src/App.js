import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import axios from "axios";
import Login from "./components/Accounts/Login";
import CreateAccount from "./components/Accounts/CreateAccount";
import EditAccount from "./components/Accounts/EditAccount";
import Home from "./components/Pages/Home";
import Sidebar from "./components/Shared/Sidebar"; // Import Sidebar component
import BoardsList from "./components/Boards/BoardsList";
import BoardShow from "./components/Boards/BoardShow";
import TeamsList from "./components/Teams/TeamsList";
import TeamForm from "./components/Teams/TeamForm";
import CreateBoard from "./components/Boards/CreateBoard";
import TasksList from "./components/Tasks/TasksList"; // Import tasks components
import TaskForm from "./components/Tasks/TaskForm";
import ErrorMessage from "./components/Shared/ErrorMessage";
import AdminPage from "./components/Pages/AdminPage";
import Notifications from "./components/Shared/Notifications";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // Store current user info
  const [boards, setBoards] = useState([]); // Store board data
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state to prevent premature redirects
  const showError = error ? <ErrorMessage message={error} /> : null;
  const baseUrl = `${process.env.REACT_APP_BASE_URL}:${process.env.REACT_APP_API_PORT}`;

  // Function to fetch boards
  const fetchBoards = async (token) => {
    try {
      const response = await axios.get(`/api/boards`, {
        headers: {
          Authorization: `Bearer ${token}`, // Use token from sessionStorage
        },
        withCredentials: true, // Ensure credentials are sent with the request
      });
      setBoards(response.data.boards);
    } catch (error) {
      console.error("Error fetching boards:", error);
      if (error.response && error.response.status === 401) {
        setError("Unauthorized access. Please log in again.");
        setIsAuthenticated(false);
      } else {
        setError("Failed to load boards");
      }
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem("authToken");
    const storedUser = sessionStorage.getItem("currentUser");

    if (token && storedUser) {
      setIsAuthenticated(true);
      setCurrentUser(JSON.parse(storedUser)); // Parse and set the user from sessionStorage
      fetchBoards(token);
    }
    setLoading(false); // Always set loading to false after checking
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loginUser = async (email, password) => {
    try {
      const response = await axios.post(
        `${baseUrl}/users/sign_in`,
        {
          user: { email, password },
        },
        {
          withCredentials: true, // Ensures cookies are sent with the request
        }
      );
      if (response.status === 200) {
        // Extract JWT token from the response headers
        const token = response.headers.authorization.split(" ")[1]; // 'Bearer <token>'

        // Store token and user details in sessionStorage
        sessionStorage.setItem("authToken", token); // Store token in sessionStorage
        sessionStorage.setItem(
          "currentUser",
          JSON.stringify({
            id: response.data.user.id,
            firstName: response.data.user.first_name, // Retrieve from response
            email: response.data.user.email,
            role: response.data.user.role,
          })
        );

        // Set the authenticated state and current user
        setIsAuthenticated(true);
        setCurrentUser({
          firstName: response.data.user.first_name, // Use real data from response
          email: response.data.user.email,
          role: response.data.user.role,
        });

        // Fetch boards after login
        fetchBoards(token); // Fetch the boards right after login
      }
    } catch (error) {
      console.error("Login failed:", error);
      setError("Failed to log in. Please check your credentials.");
    }
  };

  // Define the logout function
  const logoutUser = async () => {
    try {
      const response = await axios.delete(`${baseUrl}/users/sign_out`, {
        withCredentials: true, // Ensure cookies are sent with the request
      });
      if (response.status === 200) {
        setIsAuthenticated(false);
        sessionStorage.removeItem("authToken"); // Clear token from sessionStorage
        sessionStorage.removeItem("currentUser"); // Clear user details from sessionStorage
        setCurrentUser(null); // Clear current user state
        setBoards([]);
      }
    } catch (error) {
      console.error("Logout failed:", error);
      setError("Failed to log out. Please try again.");
    }
  };

  // Show a loading indicator until authentication is verified
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="container-fluid min-vh-100 bg-dark">
        <div className="row">
          {/* Render Sidebar for authenticated users */}
          {isAuthenticated && (
            <div className="col-md-2">
              <Sidebar
                currentUser={currentUser}
                boards={boards}
                logoutUser={logoutUser} // Pass logoutUser to Sidebar
              />
            </div>
          )}

          <main className={isAuthenticated ? "col-md-10 ms-auto" : "w-100"}>
            {showError}
            {/* Render the Notifications component */}
            {isAuthenticated && <Notifications />}
            <Routes>
              {/* Login route - accessible to unauthenticated users */}
              <Route
                path="/login"
                element={
                  !isAuthenticated ? (
                    <Login loginUser={loginUser} />
                  ) : (
                    <Navigate to="/home" />
                  )
                }
              />

              <Route
                path="/signup"
                element={
                  <CreateAccount
                    isAdmin={currentUser?.role === "admin"}
                    setIsAuthenticated={setIsAuthenticated}
                    setCurrentUser={setCurrentUser}
                  />
                }
              />

              {/* Home route - accessible only to authenticated users */}
              <Route
                path="/home"
                element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
              />

              {/* Boards routes */}
              <Route
                path="/boards"
                element={
                  isAuthenticated ? <BoardsList /> : <Navigate to="/login" />
                }
              />
              <Route
                path="/boards/new"
                element={
                  isAuthenticated ? <CreateBoard /> : <Navigate to="/login" />
                }
              />
              <Route
                path="/boards/:id"
                element={
                  isAuthenticated ? <BoardShow /> : <Navigate to="/login" />
                }
              />

              {/* Teams routes */}
              <Route
                path="/teams"
                element={
                  isAuthenticated ? <TeamsList /> : <Navigate to="/login" />
                }
              />
              <Route
                path="/teams/new"
                element={
                  isAuthenticated ? <TeamForm /> : <Navigate to="/login" />
                }
              />
              <Route
                path="/teams/:id/edit"
                element={
                  isAuthenticated ? <TeamForm /> : <Navigate to="/login" />
                }
              />

              {/* Default route */}
              <Route
                path="*"
                element={
                  isAuthenticated ? (
                    <Navigate to="/home" />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />

              {/* Add task routes */}
              <Route
                path="/tasks"
                element={
                  isAuthenticated ? <TasksList /> : <Navigate to="/login" />
                }
              />
              <Route
                path="/tasks/new"
                element={
                  isAuthenticated ? <TaskForm /> : <Navigate to="/login" />
                }
              />
              <Route
                path="/tasks/:id/edit"
                element={
                  isAuthenticated ? <TaskForm /> : <Navigate to="/login" />
                }
              />

              {/* AdminPage route - accessible only to admins */}
              <Route
                path="/admin"
                element={
                  isAuthenticated && currentUser.role === "admin" ? (
                    <AdminPage />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />

              {/* Route for editing a user */}
              <Route
                path="/users/:id/edit"
                element={
                  isAuthenticated ? (
                    <EditAccount currentUser={currentUser} />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
