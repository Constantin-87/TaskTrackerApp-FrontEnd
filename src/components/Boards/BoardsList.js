// components/Boards/BoardsList.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { getAccessToken } from "../../components/Accounts/Auth";

const BoardsList = () => {
  const [boards, setBoards] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch boards from the backend
    const fetchBoards = async () => {
      try {
        const token = getAccessToken();
        const response = await axios.get(`/api/boards`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBoards(response.data.boards);
      } catch (err) {
        setError("Error fetching boards");
      }
    };

    fetchBoards();
  }, []);

  return (
    <div>
      <h1>Boards</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <ul className="list-group">
        {boards.map((board) => (
          <li key={board.id} className="list-group-item">
            <Link to={`/boards/${board.id}`}>{board.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BoardsList;
