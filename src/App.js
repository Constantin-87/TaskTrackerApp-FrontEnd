import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  Outlet,
} from "react-router-dom";
import axios from "axios";
import Login from "./components/Accounts/Login";
import CreateAccount from "./components/Accounts/CreateAccount";
import EditAccount from "./components/Accounts/EditAccount";
import Home from "./components/Pages/Home";
import Sidebar from "./components/Shared/Sidebar";
import BoardsList from "./components/Boards/BoardsList";
import BoardShow from "./components/Boards/BoardShow";
import TeamsList from "./components/Teams/TeamsList";
import TeamForm from "./components/Teams/TeamForm";
import CreateBoard from "./components/Boards/CreateBoard";
import TasksList from "./components/Tasks/TasksList";
import TaskForm from "./components/Tasks/TaskForm";
import ErrorMessage from "./components/Shared/ErrorMessage";
import AdminPage from "./components/Pages/AdminPage";
import Notifications from "./components/Shared/Notifications";
import {
  loginUser,
  logoutUser,
  getCurrentUser,
  getAccessToken,
} from "./components/Accounts/Auth";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [boards, setBoards] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state to prevent premature redirects

  useEffect(() => {
    const user = getCurrentUser();
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
      if (!token) return;

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
    try {
      await loginUser(email, password);
      setCurrentUser(getCurrentUser());
      fetchBoards();
      return null;
    } catch (err) {
      return "Invalid login credentials";
    }
  };

  // Logout function
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

  const LayoutWithSidebar = () => (
    <div className="container-fluid">
      <div className="row">
        {/* Conditionally render Sidebar if currentUser exists */}
        {currentUser && (
          <div className="sidebar">
            <Sidebar
              currentUser={currentUser}
              boards={boards}
              logoutUser={handleLogout}
            />
          </div>
        )}
        <div className="main-content">
          {error && <ErrorMessage message={error} />}
          <Notifications currentUser={currentUser} />
          <Outlet />
        </div>
      </div>
    </div>
  );

  return (
    <Router>
      <Routes>
        {/* Unauthenticated routes */}
        <Route element={<LayoutWithSidebar />}>
          <Route path="/login" element={<Login loginUser={handleLogin} />} />
          <Route path="/signup" element={<CreateAccount />} />
        </Route>

        {/* Authenticated routes */}
        <Route
          element={
            currentUser ? <LayoutWithSidebar /> : <Navigate to="/login" />
          }
        >
          <Route path="/home" element={<Home />} />

          {/* Boards routes */}
          <Route path="/boards" element={<BoardsList />} />
          <Route path="/boards/new" element={<CreateBoard />} />
          <Route path="/boards/:id" element={<BoardShow />} />

          {/* Teams routes */}
          <Route path="/teams" element={<TeamsList />} />
          <Route path="/teams/new" element={<TeamForm />} />
          <Route path="/teams/:id/edit" element={<TeamForm />} />

          {/* Tasks routes */}
          <Route path="/tasks" element={<TasksList />} />
          <Route path="/tasks/new" element={<TaskForm />} />
          <Route path="/tasks/:id/edit" element={<TaskForm />} />

          {/* Admin routes */}
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

          {/* Edit user account */}
          <Route
            path="/users/:id/edit"
            element={
              <EditAccount
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
              />
            }
          />
        </Route>

        {/* Redirect unknown routes */}
        <Route
          path="*"
          element={<Navigate to={currentUser ? "/home" : "/login"} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
