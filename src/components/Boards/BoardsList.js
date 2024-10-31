// components/Boards/BoardsList.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const BoardsList = () => {
  const [boards, setBoards] = useState([]);
  const [error, setError] = useState(null);
  const baseUrl = `${process.env.REACT_APP_BASE_URL}:${process.env.REACT_APP_API_PORT}`;

  useEffect(() => {
    // Fetch boards from the backend
    const fetchBoards = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/boards`);
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
