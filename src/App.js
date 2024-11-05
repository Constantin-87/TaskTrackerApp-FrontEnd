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
import {
  loginUser,
  logoutUser,
  getCurrentUser,
  getAccessToken,
} from "./components/Accounts/Auth"; // Import authentication functions

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [boards, setBoards] = useState([]); // Store board data
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state to prevent premature redirects
  const showError = error ? <ErrorMessage message={error} /> : null;

  useEffect(() => {
    const user = getCurrentUser();
    console.log("User retrieved on initial load:", user);
    if (user) {
      setCurrentUser(user);
      fetchBoards();
    }
    setLoading(false);
  }, []);

  // Function to fetch boards
  const fetchBoards = async () => {
    try {
      const token = await getAccessToken();
      console.log("Using token for fetchBoards:", token);
      if (!token) return; // Exit if no token

      const response = await axios.get("/api/boards", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setBoards(response.data.boards);
    } catch (error) {
      console.error("Error fetching boards:", error);
      setError("Failed to load boards");
    }
  };

  const handleLogin = async (email, password) => {
    setError(null);
    try {
      await loginUser(email, password);
      setCurrentUser(getCurrentUser());
      fetchBoards();
    } catch (err) {
      setError(err.message);
    }
  };

  // Define the logout function
  const handleLogout = async () => {
    try {
      await logoutUser();
      setBoards([]);
      setCurrentUser(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Show a loading indicator until authentication is verified
  if (loading) {
    return <div>Loading...</div>;
  }
  console.log("App currentUser  before sidebar:", currentUser);
  console.log("App currentUser before sidebar:", currentUser.firstName);
  return (
    <Router>
      <div className="container-fluid min-vh-100 bg-dark">
        <div className="row">
          {/* Render Sidebar for authenticated users */}
          {currentUser && (
            <div className="col-md-2">
              <Sidebar
                currentUser={currentUser}
                boards={boards}
                logoutUser={handleLogout} // Pass logoutUser to Sidebar
              />
            </div>
          )}

          <main className={currentUser ? "col-md-10 ms-auto" : "w-100"}>
            {showError}
            {/* Render the Notifications component */}
            {currentUser && <Notifications />}

            <Routes>
              {/* Login route - accessible to unauthenticated users */}
              <Route
                path="/login"
                element={
                  !currentUser ? (
                    <Login loginUser={handleLogin} />
                  ) : (
                    <Navigate to="/home" />
                  )
                }
              />

              <Route path="/signup" element={<CreateAccount />} />

              {/* Home route - accessible only to authenticated users */}
              <Route
                path="/home"
                element={currentUser ? <Home /> : <Navigate to="/login" />}
              />

              {/* Boards routes */}
              <Route
                path="/boards"
                element={
                  currentUser ? <BoardsList /> : <Navigate to="/login" />
                }
              />
              <Route
                path="/boards/new"
                element={
                  currentUser ? <CreateBoard /> : <Navigate to="/login" />
                }
              />
              <Route
                path="/boards/:id"
                element={currentUser ? <BoardShow /> : <Navigate to="/login" />}
              />

              {/* Teams routes */}
              <Route
                path="/teams"
                element={currentUser ? <TeamsList /> : <Navigate to="/login" />}
              />
              <Route
                path="/teams/new"
                element={currentUser ? <TeamForm /> : <Navigate to="/login" />}
              />
              <Route
                path="/teams/:id/edit"
                element={currentUser ? <TeamForm /> : <Navigate to="/login" />}
              />

              {/* Default route */}
              <Route
                path="*"
                element={
                  currentUser ? (
                    <Navigate to="/home" />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />

              {/* Add task routes */}
              <Route
                path="/tasks"
                element={currentUser ? <TasksList /> : <Navigate to="/login" />}
              />
              <Route
                path="/tasks/new"
                element={currentUser ? <TaskForm /> : <Navigate to="/login" />}
              />
              <Route
                path="/tasks/:id/edit"
                element={currentUser ? <TaskForm /> : <Navigate to="/login" />}
              />

              {/* AdminPage route - accessible only to admins */}
              <Route
                path="/admin"
                element={
                  currentUser?.role === "admin" ? (
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
                  currentUser ? (
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
