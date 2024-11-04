import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Sidebar = ({ currentUser, boards, logoutUser }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser(); // Execute the logout API call
    navigate("/login"); // Navigate to login after logout
  };

  // State to manage the open/close state of accordions
  const [isBoardsOpen, setIsBoardsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Toggle the Boards accordion
  const toggleBoardsAccordion = () => {
    setIsBoardsOpen(!isBoardsOpen);
  };

  // Toggle the Admin accordion
  const toggleAdminAccordion = () => {
    setIsAdminOpen(!isAdminOpen);
  };

  return (
    <nav id="sidebarMenu" className="d-md-block bg-dark sidebar collapse">
      <div className="position-sticky pt-3" style={{ overflowY: "auto" }}>
        {/* User info */}
        <h5 className="text-center text-light mb-4">
          Welcome, {currentUser ? currentUser.firstName : "Guest"}
          {currentUser && currentUser.role ? ` (${currentUser.role})` : ""}
        </h5>

        {/* Navigation Items */}
        <ul className="nav flex-column">
          {/* Home Link */}
          <li className="nav-item mb-2">
            <Link
              to="/home"
              className="nav-link text-light d-flex align-items-center"
            >
              <i className="bi bi-house me-2"></i> Home
            </Link>
          </li>

          {/* Boards Accordion */}
          <li className="nav-item mb-2">
            <div className="accordion bg-dark">
              <div className="accordion-item bg-dark border-0">
                <h2 className="accordion-header">
                  <button
                    className={`accordion-button text-light bg-dark shadow-none d-flex align-items-center ${
                      isBoardsOpen ? "" : "collapsed"
                    }`}
                    type="button"
                    onClick={toggleBoardsAccordion}
                  >
                    <i className="bi bi-columns-gap me-2"></i> Boards
                  </button>
                </h2>
                <div
                  className={`accordion-collapse collapse ${
                    isBoardsOpen ? "show" : ""
                  }`}
                >
                  <div className="accordion-body p-0">
                    <ul className="list-group list-group-flush bg-dark">
                      {/* Add New Board (only for admins and managers) */}
                      {(currentUser.role === "admin" ||
                        currentUser.role === "manager") && (
                        <li className="list-group-item bg-dark text-light border-0">
                          <Link
                            to="/boards/new"
                            className="nav-link text-light d-flex align-items-center"
                          >
                            <i className="bi bi-plus-lg me-2"></i> Add New Board
                          </Link>
                        </li>
                      )}

                      {/* Display Boards */}
                      {boards && boards.length > 0 ? (
                        boards.map((board) => (
                          <li
                            key={board.id}
                            className="list-group-item bg-dark text-light border-0"
                          >
                            <Link
                              to={`/boards/${board.id}`}
                              className="nav-link text-light d-flex align-items-center"
                            >
                              <i className="bi bi-folder2-open me-2"></i>{" "}
                              {board.name}
                            </Link>
                          </li>
                        ))
                      ) : (
                        <li className="list-group-item bg-dark text-light">
                          No boards available
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </li>

          {/* Administration Accordion (Only for Admins) */}
          {currentUser.role === "admin" && (
            <li className="nav-item mt-2">
              <div className="accordion bg-dark">
                <div className="accordion-item bg-dark border-0">
                  <h2 className="accordion-header">
                    <button
                      className={`accordion-button text-light bg-dark shadow-none d-flex align-items-center ${
                        isAdminOpen ? "" : "collapsed"
                      }`}
                      type="button"
                      onClick={toggleAdminAccordion}
                    >
                      <i className="bi bi-gear-fill me-2"></i> Administration
                    </button>
                  </h2>
                  <div
                    className={`accordion-collapse collapse ${
                      isAdminOpen ? "show" : ""
                    }`}
                  >
                    <div className="accordion-body p-0">
                      <ul className="list-group list-group-flush bg-dark">
                        <li className="list-group-item bg-dark text-light border-0">
                          <Link
                            to="/teams"
                            className="nav-link text-light d-flex align-items-center"
                          >
                            <i className="bi bi-people-fill me-2"></i> Teams
                          </Link>
                        </li>
                        <li className="list-group-item bg-dark text-light border-0">
                          <Link
                            to="/admin"
                            className="nav-link text-light d-flex align-items-center"
                          >
                            <i className="bi bi-tools me-2"></i> Admin
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          )}

          {/* Edit Account Button */}
          {currentUser?.id && (
            <li className="nav-item mb-2">
              <Link
                to={`/users/${currentUser.id}/edit`} // Link to the current user's edit page
                className="nav-link text-light d-flex align-items-center"
              >
                <i className="bi bi-pencil-square me-2"></i> Edit My Account
              </Link>
            </li>
          )}

          {/* Sign Out Link */}
          <li className="nav-item mt-4">
            <button
              onClick={handleLogout} // Use the handleLogout here
              className="nav-link text-light d-flex align-items-center bg-dark border-0"
              style={{ cursor: "pointer" }}
            >
              <i className="bi bi-box-arrow-left me-2"></i> Sign Out
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Sidebar;
