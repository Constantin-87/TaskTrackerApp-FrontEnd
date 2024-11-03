import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import AccordionItem from "../Shared/AccordionItem";

const Home = () => {
  const [tasks, setTasks] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const location = useLocation();

  const fetchTasks = useCallback(async () => {
    try {
      const token = sessionStorage.getItem("authToken");
      const response = await axios.get(`/api/tasks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      setTasks(response.data.tasks); // Set tasks from the response
      setStatusOptions(response.data.status_options || []); // Set available status options
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError("Failed to load tasks");
    }
  }, []);

  useEffect(() => {
    fetchTasks();

    // Parse query parameter for task_id
    const params = new URLSearchParams(location.search);
    const taskId = params.get("task_id");
    if (taskId) {
      setExpandedTaskId(Number(taskId));
    }
  }, [fetchTasks, location]);

  // Function to update task status
  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const token = sessionStorage.getItem("authToken");
      await axios.put(
        `/api/tasks/${taskId}`,
        { task: { status: newStatus } },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Update task status in the local state after successful API call
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (error) {
      console.error("Error updating task status:", error);
      setError("Failed to update task status.");
    }
  };

  return (
    <div className="task-content-container">
      <h1 className="display-4 text-center text-light mb-4">Your Tasks</h1>
      {error && <p className="text-danger">{error}</p>}
      {tasks.length > 0 ? (
        <div className="accordion" id="tasksAccordion">
          {tasks.map((task) => {
            const isExpanded = task.id === expandedTaskId;
            return (
              <AccordionItem
                key={task.id}
                title={`${task.title} : Board: ${task.board.name} | Priority: ${
                  task.priority.charAt(0).toUpperCase() + task.priority.slice(1)
                }`}
                isExpanded={isExpanded}
                onToggle={() => setExpandedTaskId(isExpanded ? null : task.id)} // Toggle expanded state
              >
                <div className="p-4 bg-dark text-light rounded">
                  <p className="mb-2">
                    <strong>Description:</strong> {task.description}
                  </p>
                  <p className="mb-2">
                    <strong>Due Date:</strong>{" "}
                    {new Date(task.due_date).toLocaleDateString()}
                  </p>

                  <div className="d-flex align-items-center mb-3">
                    <select
                      className="form-select bg-secondary text-light"
                      value={task.status}
                      onChange={(e) =>
                        updateTaskStatus(task.id, e.target.value)
                      }
                      style={{ maxWidth: "200px" }}
                    >
                      {Object.entries(statusOptions).map(([key, value]) => (
                        <option key={key} value={key}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <button
                      className="btn btn-warning text-dark me-2"
                      onClick={() => navigate(`/tasks/${task.id}/edit`)}
                    >
                      Edit Task
                    </button>
                  </div>
                </div>
              </AccordionItem>
            );
          })}
        </div>
      ) : (
        <p className="text-light">You have no tasks assigned at the moment.</p>
      )}
    </div>
  );
};

export default Home;
