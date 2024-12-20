import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Tooltip, OverlayTrigger } from "react-bootstrap";
import FlashMessage from "../Shared/FlashMessage";
import ErrorMessage from "../Shared/ErrorMessage";
import { getAccessToken, getCurrentUser } from "../../components/Accounts/Auth";

const BoardShow = () => {
  const { id } = useParams();
  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [statusOptions, setStatusOptions] = useState({});
  const [priorityOptions, setPriorityOptions] = useState({});
  const [users, setUsers] = useState([]);
  const [flashMessage, setFlashMessage] = useState("");
  const [error, setError] = useState(null);
  const [isDescriptionCollapsed, setIsDescriptionCollapsed] = useState(true);
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const token = await getAccessToken();
        const boardResponse = await axios.get(`/api/boards/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBoard(boardResponse.data.board);
        setUsers(boardResponse.data.users);
      } catch (err) {
        setError("Error fetching board");
      }
    };

    fetchBoard();
  }, [id]);

  // Fetch tasks with status and priority options
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = await getAccessToken();
        const tasksResponse = await axios.get(`/api/tasks?board_id=${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTasks(tasksResponse.data.tasks);
        setStatusOptions(tasksResponse.data.status_options);
        setPriorityOptions(tasksResponse.data.priority_options);
      } catch (err) {
        setError("Error fetching tasks.");
      }
    };
    fetchTasks();
  }, [id]);

  const handleDeleteTask = async (taskId) => {
    const token = await getAccessToken();
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await axios.delete(`/api/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFlashMessage("Task deleted successfully!");
        setTasks(tasks.filter((task) => task.id !== taskId));
      } catch (err) {
        setError("Error deleting task.");
      }
    }
  };

  const handleDeleteBoard = async () => {
    const token = await getAccessToken();
    try {
      await axios.delete(`/api/boards/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFlashMessage("Board deleted successfully!");
      setTimeout(() => {
        navigate("/home");
      }, 2000);
    } catch (err) {
      setError("Error deleting board.");
    }
  };

  const toggleDescription = () => {
    setIsDescriptionCollapsed(!isDescriptionCollapsed);
  };

  const renderTooltip = (props) => (
    <Tooltip id="button-tooltip" {...props}>
      {props.description}
    </Tooltip>
  );

  if (!board) {
    return <div>Loading...</div>;
  }

  const description = board.description || ""; // Safeguard against undefined description

  const handleTaskUpdate = async (taskId, updatedFields) => {
    try {
      const token = await getAccessToken();
      await axios.put(
        `/api/tasks/${taskId}`,
        { task: updatedFields },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, ...updatedFields } : task
        )
      );
    } catch (err) {
      setError("Error updating the task.");
    }
  };

  return (
    <div>
      <h1 className="display-4 text-left text-light mb-4">{board.name}</h1>

      {/* FlashMessage displayed on successful user deletion */}
      {flashMessage && <FlashMessage message={flashMessage} />}

      {/* ErrorMessage displayed when there’s an error */}
      {error && <ErrorMessage message={error} />}

      {/* Collapsible Board Description */}
      <div className="board-description text-light mb-3">
        <h5>Board Description:</h5>
        <div onClick={toggleDescription} style={{ cursor: "pointer" }}>
          {isDescriptionCollapsed
            ? description.length > 100
              ? `${description.substring(0, 100)}...`
              : description
            : description}{" "}
          <i
            className={`bi bi-chevron-${isDescriptionCollapsed ? "down" : "up"}`}
          ></i>
        </div>
      </div>

      {/* Add Task Button (for admin/manager) */}
      <div className="d-flex align-items-center mb-3">
        <button
          className="btn btn-success me-3"
          onClick={() => navigate(`/tasks/new?board_id=${id}`)}
        >
          Add New Task
        </button>

        {/* Delete Board Button (for admin) */}
        {currentUser.role === "admin" &&
          (tasks.length > 0 ? (
            <button
              className="btn btn-danger"
              onClick={() => {
                if (
                  window.confirm(
                    `${board.name} board has tasks. Deleting this board will also delete all associated tasks. Are you sure you want to continue?`
                  )
                ) {
                  handleDeleteBoard();
                }
              }}
            >
              Delete Board
            </button>
          ) : (
            <button
              className="btn btn-danger"
              onClick={() => {
                if (
                  window.confirm(
                    `Are you sure you want to delete ${board.name}?`
                  )
                ) {
                  handleDeleteBoard();
                }
              }}
            >
              Delete Board
            </button>
          ))}
      </div>

      {/* Tasks Table */}
      <table className="table table-hover table-bordered table-dark">
        <thead className="thead-light">
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Assigned User</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td>{task.title}</td>

              {/* Truncated Description with Tooltip */}
              <td>
                <OverlayTrigger
                  placement="top"
                  overlay={renderTooltip({ description: task.description })}
                >
                  <span
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxHeight: "3.6em",
                    }}
                  >
                    {task.description}
                  </span>
                </OverlayTrigger>
              </td>

              <td>{new Date(task.due_date).toLocaleDateString()}</td>

              {/* Task Status Dropdown */}
              <td>
                <select
                  value={task.status}
                  onChange={(e) =>
                    handleTaskUpdate(task.id, { status: e.target.value })
                  }
                  className="form-control bg-secondary text-light"
                >
                  {Object.entries(statusOptions).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </td>

              {/* Task Priority Dropdown */}
              <td>
                <select
                  value={task.priority}
                  onChange={(e) =>
                    handleTaskUpdate(task.id, { priority: e.target.value })
                  }
                  className="form-control bg-secondary text-light"
                >
                  {Object.entries(priorityOptions).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </td>

              {/* Assigned User */}
              <td>
                <select
                  className="form-select"
                  value={task.user_id || ""}
                  onChange={(e) =>
                    handleTaskUpdate(task.id, { user_id: e.target.value })
                  }
                >
                  <option value="">Unassigned</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name}
                    </option>
                  ))}
                </select>
              </td>

              {/* Edit and Delete Actions */}
              <td className="text-center d-flex justify-content-center align-items-center">
                <button
                  className="btn btn-outline-warning me-2"
                  style={{ height: "40px", width: "50px", padding: "0" }}
                  onClick={() => navigate(`/tasks/${task.id}/edit`)}
                >
                  Edit
                </button>
                {/* Conditionally render delete task button based on role */}
                {(currentUser.role === "admin" ||
                  currentUser.role === "manager") && (
                  <button
                    className="btn btn-outline-danger me-2"
                    style={{ height: "40px", width: "55px", padding: "0" }}
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BoardShow;
