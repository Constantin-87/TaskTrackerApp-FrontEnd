import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import ErrorMessage from "../Shared/ErrorMessage";
import FlashMessage from "../Shared/FlashMessage";

const TeamForm = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [, setUsers] = useState([]); // All available users
  const [, setBoards] = useState([]); // All available boards
  const [assignedUsers, setAssignedUsers] = useState([]); // Assigned users
  const [unassignedUsers, setUnassignedUsers] = useState([]); // Unassigned users
  const [assignedBoards, setAssignedBoards] = useState([]); // Assigned boards
  const [unassignedBoards, setUnassignedBoards] = useState([]); // Unassigned boards
  const [error, setError] = useState(null);
  const [flashMessage, setFlashMessage] = useState("");
  const { id } = useParams(); // For edit case
  const navigate = useNavigate();
  const baseUrl = `${process.env.REACT_APP_BASE_URL}:${process.env.REACT_APP_API_PORT}`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem("authToken");

        const userResponse = await axios.get(`${baseUrl}/api/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const boardResponse = await axios.get(`${baseUrl}/api/boards`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const allUsers = userResponse.data.users;
        const allBoards = boardResponse.data.boards;

        setUsers(allUsers);
        setBoards(Array.isArray(allBoards) ? allBoards : []);

        if (id) {
          const teamResponse = await axios.get(`${baseUrl}/api/teams/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          setName(teamResponse.data.name);
          setDescription(teamResponse.data.description);

          setAssignedUsers(teamResponse.data.users);
          setAssignedBoards(teamResponse.data.boards);

          // Filter out assigned users and boards to update the unassigned lists
          setUnassignedUsers(
            allUsers.filter(
              (user) => !teamResponse.data.users.some((u) => u.id === user.id)
            )
          );
          setUnassignedBoards(
            allBoards.filter(
              (board) =>
                !teamResponse.data.boards.some((b) => b.id === board.id)
            )
          );
        } else {
          setUnassignedUsers(allUsers);
          setUnassignedBoards(allBoards);
        }
      } catch (err) {
        setError("Failed to load data.");
      }
    };
    fetchData();
  }, [baseUrl, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = sessionStorage.getItem("authToken"); // Retrieve the JWT token from sessionStorage

      const teamData = {
        name,
        description,
        user_ids: assignedUsers.map((user) => user.id),
        board_ids: assignedBoards.map((board) => board.id),
      };

      if (id) {
        await axios.put(
          `${baseUrl}/api/teams/${id}`,
          {
            team: teamData,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include the JWT token
            },
          }
        );
        setFlashMessage("Team updated successfully!");
      } else {
        await axios.post(
          `${baseUrl}/api/teams`,
          {
            team: teamData,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`, // Include the JWT token
            },
          }
        );
        setFlashMessage("Team created successfully!");
      }

      setTimeout(() => navigate("/teams"), 3000);
    } catch (err) {
      setError("Error saving the team.");
    }
  };

  // Move selected items between the assigned/unassigned lists
  const moveItems = (from, to, setFrom, setTo, selectedItems) => {
    const selectedIds = Array.from(selectedItems).map((option) => option.value);
    const itemsToMove = from.filter((item) =>
      selectedIds.includes(item.id.toString())
    );

    setTo([...to, ...itemsToMove]);
    setFrom(from.filter((item) => !selectedIds.includes(item.id.toString())));
  };

  return (
    <div>
      <h1>{id ? "Edit Team" : "Create New Team"}</h1>
      {error && <ErrorMessage message={error} />}
      {flashMessage && <FlashMessage message={flashMessage} />}
      <form
        onSubmit={handleSubmit}
        className="bg-dark text-light p-4 rounded shadow"
      >
        <div className="form-group mb-3">
          <label className="form-label">Team Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-control bg-secondary text-light"
            placeholder="Enter team name"
          />
        </div>

        <div className="form-group mb-3">
          <label className="form-label">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-control bg-secondary text-light"
            rows="5"
            placeholder="Enter team description"
          />
        </div>

        {/* Dual Listbox for Users */}
        <div className="form-group mb-3">
          <div className="row">
            <div className="col-md-5">
              <h6>Available Users</h6>
              <select
                className="form-control bg-secondary text-light"
                size="8"
                multiple
                id="unassignedUsers"
              >
                {unassignedUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-2 d-flex flex-column justify-content-center">
              <button
                type="button"
                className="btn btn-success mb-2"
                onClick={() => {
                  const selectedUsers =
                    document.getElementById("unassignedUsers").selectedOptions;
                  if (selectedUsers.length > 0) {
                    moveItems(
                      unassignedUsers,
                      assignedUsers,
                      setUnassignedUsers,
                      setAssignedUsers,
                      selectedUsers
                    );
                  }
                }}
              >
                Assign &gt;&gt;
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  const selectedUsers =
                    document.getElementById("assignedUsers").selectedOptions;
                  if (selectedUsers.length > 0) {
                    moveItems(
                      assignedUsers,
                      unassignedUsers,
                      setAssignedUsers,
                      setUnassignedUsers,
                      selectedUsers
                    );
                  }
                }}
              >
                &lt;&lt; Unassign
              </button>
            </div>

            <div className="col-md-5">
              <h6>Assigned Users</h6>
              <select
                className="form-control bg-secondary text-light"
                size="8"
                multiple
                id="assignedUsers"
              >
                {assignedUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.first_name} {user.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Boards selection similar to the above */}
        <div className="form-group mb-3">
          <div className="row">
            <div className="col-md-5">
              <h6>Available Boards</h6>
              <select
                className="form-control bg-secondary text-light"
                size="8"
                multiple
                id="unassignedBoards"
              >
                {unassignedBoards.map((board) => (
                  <option key={board.id} value={board.id}>
                    {board.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-2 d-flex flex-column justify-content-center">
              <button
                type="button"
                className="btn btn-success mb-2"
                onClick={() => {
                  const selectedBoards =
                    document.getElementById("unassignedBoards").selectedOptions;
                  if (selectedBoards.length > 0) {
                    moveItems(
                      unassignedBoards,
                      assignedBoards,
                      setUnassignedBoards,
                      setAssignedBoards,
                      selectedBoards
                    );
                  }
                }}
              >
                Assign &gt;&gt;
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  const selectedBoards =
                    document.getElementById("assignedBoards").selectedOptions;
                  if (selectedBoards.length > 0) {
                    moveItems(
                      assignedBoards,
                      unassignedBoards,
                      setAssignedBoards,
                      setUnassignedBoards,
                      selectedBoards
                    );
                  }
                }}
              >
                &lt;&lt; Unassign
              </button>
            </div>

            <div className="col-md-5">
              <h6>Assigned Boards</h6>
              <select
                className="form-control bg-secondary text-light"
                size="8"
                multiple
                id="assignedBoards"
              >
                {assignedBoards.map((board) => (
                  <option key={board.id} value={board.id}>
                    {board.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button type="submit" className="btn btn-primary">
          {id ? "Update Team" : "Create Team"}
        </button>
      </form>
    </div>
  );
};

export default TeamForm;
