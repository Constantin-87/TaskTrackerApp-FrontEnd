import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import ErrorMessage from "../Shared/ErrorMessage";

const TasksList = () => {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState(null);
  const baseUrl = `${process.env.REACT_APP_BASE_URL}:${process.env.REACT_APP_API_PORT}`;

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = sessionStorage.getItem("authToken");
        const response = await axios.get(`${baseUrl}/api/tasks`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTasks(response.data.tasks);
      } catch (err) {
        setError("Failed to load tasks.");
      }
    };

    fetchTasks();
  }, [baseUrl]);

  return (
    <div>
      <h1>Tasks</h1>
      {error && <ErrorMessage message={error} />}
      <table className="table table-dark">
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Board</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td>{task.title}</td>
              <td>{task.description}</td>
              <td>{task.due_date}</td>
              <td>{task.status}</td>
              <td>{task.priority}</td>
              <td>{task.board.name}</td>
              <td>
                <Link
                  to={`/tasks/${task.id}/edit`}
                  className="btn btn-warning btn-sm"
                >
                  Edit
                </Link>
                &nbsp;
                <button className="btn btn-danger btn-sm">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Link to="/tasks/new" className="btn btn-primary">
        Create New Task
      </Link>
    </div>
  );
};

export default TasksList;
