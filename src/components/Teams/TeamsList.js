import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ErrorMessage from "../Shared/ErrorMessage";
import FlashMessage from "../Shared/FlashMessage";
import { getAccessToken } from "../../components/Accounts/Auth";

const TeamsList = () => {
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState(null);
  const [flashMessage, setFlashMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        // Get the token from sessionStorage
        const token = await getAccessToken();

        const response = await axios.get(`/api/teams`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTeams(response.data);
      } catch (err) {
        setError("Failed to load teams.");
      }
    };
    fetchTeams();
  }, []);

  const handleDelete = async (teamId) => {
    if (window.confirm("Are you sure you want to delete this team?")) {
      try {
        const token = await getAccessToken();

        await axios.delete(`/api/teams/${teamId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTeams(teams.filter((team) => team.id !== teamId));
        setFlashMessage("Team successfully deleted.");
      } catch (err) {
        setError("Failed to delete team.");
      }
    }
  };

  return (
    <div>
      <h1 className="display-4 text-left text-light mb-4">Manage Teams</h1>
      {error && <ErrorMessage message={error} />}
      {flashMessage && <FlashMessage message={flashMessage} />}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button
          className="btn btn-success"
          onClick={() => navigate("/teams/new")}
        >
          Create New Team
        </button>
      </div>
      <table className="table table-hover table-bordered table-dark">
        <thead>
          <tr>
            <th>Team Name</th>
            <th>Description</th>
            <th>Members</th>
            <th>Boards</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => (
            <tr key={team.id}>
              <td>{team.name}</td>
              <td>{team.description}</td>
              <td>{team.users_count} members</td>
              <td>{team.boards_count} boards</td>
              <td className="text-center">
                <button
                  className="btn btn-outline-warning me-2"
                  onClick={() => navigate(`/teams/${team.id}/edit`)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-outline-danger me-2"
                  onClick={() => handleDelete(team.id)}
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

export default TeamsList;
