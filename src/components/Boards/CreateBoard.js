import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import FlashMessage from "../Shared/FlashMessage";
import ErrorMessage from "../Shared/ErrorMessage";

const CreateBoard = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [teams, setTeams] = useState([]);
  const [teamId, setTeamId] = useState("");
  const [error, setError] = useState(null);
  const [flashMessage, setFlashMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch teams for selection
    const fetchTeams = async () => {
      try {
        const token = sessionStorage.getItem("refresh_token"); // Retrieve the token for authentication
        const response = await axios.get(`/api/teams`, {
          headers: {
            Authorization: `Bearer ${token}`, // Pass the token in the request headers
          },
        });

        // Set teams from the response (as it's returned directly)
        setTeams(response.data);
      } catch (err) {
        if (err.response && err.response.data && err.response.data.errors) {
          // Display the detailed error message from the server
          setError(err.response.data.errors.join("\n"));
        } else {
          setError("Error fetching teams");
        }
      }
    };

    fetchTeams();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!name || name.length < 2 || name.length > 25) {
      setError("Board name must be between 2 and 25 characters.");
      return;
    }
    if (!description || description.length < 20 || description.length > 300) {
      setError("Description must be between 20 and 300 characters.");
      return;
    }
    if (!teamId) {
      setError("Please select a team.");
      return;
    }

    try {
      const token = sessionStorage.getItem("refresh_token"); // Retrieve the JWT token from sessionStorage

      const response = await axios.post(
        `/api/boards`,
        {
          board: {
            name,
            description,
            team_id: teamId,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the JWT token in the headers
          },
        }
      );

      // Set the flash message for success
      setFlashMessage("Board created successfully!");

      // Redirect to the new board page after 3 seconds
      setTimeout(() => {
        navigate(`/boards/${response.data.board.id}`); // Redirect to the new board's page
      }, 3000);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.errors) {
        setError(err.response.data.errors.join("\n"));
      } else {
        setError("Error creating board");
      }
    }
  };

  return (
    <div>
      <h1>Create New Board</h1>

      {/* Display Flash Message */}
      {flashMessage && <FlashMessage message={flashMessage} />}

      {/* ErrorMessage component to display errors */}
      {error && <ErrorMessage message={error} />}

      <form
        onSubmit={handleSubmit}
        className="bg-dark text-light p-4 rounded shadow"
      >
        <div className="form-group mb-3">
          <label className="form-label">Board Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-control bg-secondary text-light"
            placeholder="Enter board title"
            style={{ width: "250px" }}
          />
        </div>

        <div className="form-group mb-3">
          <label className="form-label">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-control bg-secondary text-light"
            rows="5"
            placeholder="Board description"
            style={{ width: "500px" }}
          />
        </div>

        <div className="form-group mb-3">
          <label className="form-label">Select Team</label>
          <select
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            className="form-control bg-secondary text-light"
          >
            <option value="">Select a Team</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn btn-primary">
          Create Board
        </button>
      </form>
    </div>
  );
};

export default CreateBoard;
