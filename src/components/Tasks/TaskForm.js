import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import ErrorMessage from "../Shared/ErrorMessage";
import FlashMessage from "../Shared/FlashMessage";
import { getAccessToken } from "../../components/Accounts/Auth";

const TaskForm = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("not_started");
  const [statuses, setStatuses] = useState({});
  const [priority, setPriority] = useState("low");
  const [priorities, setPriorities] = useState({});
  const [boardId, setBoardId] = useState("");
  const [boards, setBoards] = useState([]);
  const [error, setError] = useState(null);
  const [flashMessage, setFlashMessage] = useState("");
  const { id } = useParams(); // For edit case
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchBoardsAndTask = async () => {
      try {
        const token = await getAccessToken();
        // Fetch boards
        const boardResponse = await axios.get(`/api/boards`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBoards(boardResponse.data.boards);

        // Extract board_id from the query string if not editing
        const queryParams = new URLSearchParams(location.search);
        const boardIdFromUrl = queryParams.get("board_id");

        if (!id && boardIdFromUrl) {
          // Set the board_id from the URL if creating a new task
          setBoardId(boardIdFromUrl);
        }

        const taskId = id || -1; // Use -1 if creating a new task
        const taskResponse = await axios.get(`/api/tasks/${taskId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // For new task, fetch only status and priority options
        if (id) {
          const task = taskResponse.data.task;
          setTitle(task.title);
          setDescription(task.description);
          setDueDate(task.due_date);
          setStatus(task.status);
          setPriority(task.priority);
          setBoardId(task.board_id);
        }

        setStatuses(taskResponse.data.status_options);
        setPriorities(taskResponse.data.priority_options);
      } catch (err) {
        setError("Failed to load data.");
      }
    };

    fetchBoardsAndTask();
  }, [id, location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    if (!title) {
      setError("Title is required.");
      return;
    }
    if (!description) {
      setError("Description is required.");
      return;
    }
    if (!dueDate) {
      setError("Due date is required.");
      return;
    }
    if (!boardId) {
      setError("Please select a board.");
      return;
    }

    try {
      const token = await getAccessToken();

      const taskData = {
        title,
        description,
        due_date: dueDate,
        status,
        priority,
        board_id: boardId,
      };

      if (id) {
        await axios.put(
          `/api/tasks/${id}`,
          {
            task: taskData,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setFlashMessage("Task updated successfully!");
      } else {
        await axios.post(
          `/api/tasks`,
          {
            task: taskData,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setFlashMessage("Task created successfully!");
      }

      setTimeout(() => navigate(`/boards/${boardId}`), 2000);
    } catch (err) {
      // Check if the error response contains validation errors
      if (err.response && err.response.data && err.response.data.errors) {
        // Join all error messages into a single string with line breaks
        setError(err.response.data.errors.join("\n"));
      } else {
        // Generic error message for unexpected errors
        setError("Error saving the task.");
      }
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div
      className="bg-dark text-light p-4 rounded shadow form-container"
      style={{ maxWidth: "600px" }}
    >
      <h1 className="display-6 text-left text-light mb-4">
        {id ? "Edit Task" : "Create New Task"}
      </h1>
      {error && <ErrorMessage message={error} />}
      {flashMessage && <FlashMessage message={flashMessage} />}
      <form onSubmit={handleSubmit}>
        <div className="form-group mb-3">
          <label className="form-label">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-control bg-secondary text-light"
            placeholder="Enter task title"
            style={{ maxWidth: "300px", fontSize: "20px" }}
          />
        </div>
        <div className="form-group mb-3">
          <label className="form-label">Board</label>
          <select
            value={boardId}
            onChange={(e) => setBoardId(e.target.value)}
            className="form-control bg-secondary text-light"
            style={{ maxWidth: "300px", fontSize: "20px" }}
          >
            <option value="">Select a Board</option>
            {boards.map((board) => (
              <option key={board.id} value={board.id}>
                {board.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group mb-3">
          <label className="form-label">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-control bg-secondary text-light"
            rows="5"
            placeholder="Task description"
          />
        </div>

        <div className="d-flex justify-content-between mb-3">
          <div className="form-group" style={{ flex: 1, marginRight: "10px" }}>
            <label className="form-label">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="form-control bg-secondary text-light"
              style={{ maxWidth: "170px", fontSize: "20px" }}
            />
          </div>

          <div className="form-group" style={{ flex: 1, marginLeft: "10px" }}>
            <label className="form-label">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="form-control bg-secondary text-light"
              style={{ maxWidth: "170px", fontSize: "20px" }}
            >
              {Object.entries(statuses).map(([key, value]) => (
                <option key={key} value={key}>
                  {value} {/* Display human-readable label */}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ flex: 1, marginLeft: "10px" }}>
            <label className="form-label">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="form-control bg-secondary text-light"
              style={{ maxWidth: "150px", fontSize: "20px" }}
            >
              {Object.entries(priorities).map(([key, value]) => (
                <option key={key} value={key}>
                  {value} {/* Display human-readable label */}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-secondary mb-4"
          onClick={handleBack}
        >
          Back
        </button>
        <button
          type="submit"
          className="btn btn-primary mb-4"
          style={{ marginLeft: "20px" }}
        >
          {id ? "Update Task" : "Create Task"}
        </button>
      </form>
    </div>
  );
};

export default TaskForm;
