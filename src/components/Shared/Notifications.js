import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  getAccessToken,
  isAuthenticated,
} from "../../components/Accounts/Auth";

const Notifications = ({ currentUser }) => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated() || !currentUser) {
      console.log("User not authenticated, skipping WebSocket connection");
      return;
    }
    // Initialize WebSocket
    const initializeWebSocket = async () => {
      try {
        const token = await getAccessToken();

        // Ensure token is available before initializing WebSocket
        if (!token) {
          console.error(
            "Token not available. Unable to establish WebSocket connection."
          );
          return;
        }

        // Establish WebSocket connection with the token included in the URL
        const ws = new WebSocket(`/api/notifications?token=${token}`);

        ws.onopen = () => {
          console.log("Connected to WebSocket for notifications");
        };

        ws.onmessage = (event) => {
          const newNotification = JSON.parse(event.data);
          setNotifications((prev) => [newNotification, ...prev]);
        };

        ws.onclose = () => {
          console.log("WebSocket connection closed");
        };

        // Close WebSocket connection when component unmounts
        return () => {
          ws.close();
        };
      } catch (error) {
        console.error("Error initializing WebSocket:", error);
      }
    };
    initializeWebSocket();
  }, [currentUser]);

  // Function to extract task ID from notification message
  const extractTaskId = (message) => {
    const taskIdMatch = message.match(/task_id=(\d+)/);
    return taskIdMatch ? taskIdMatch[1] : null;
  };

  const handleNotificationClick = (notification) => {
    const taskId = extractTaskId(notification.message);
    if (taskId) {
      navigate(`/home?task_id=${taskId}`);
      markAsRead(notification.id); // Mark as read after navigating
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      const token = await getAccessToken();
      await axios.put(`/api/notifications/${notificationId}`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Remove the notification from the list after marking as read
      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== notificationId)
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="position-fixed bottom-0 end-0 p-3" id="notification-box">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="alert alert-info alert-dismissible fade show"
          role="alert"
        >
          <span
            onClick={() => handleNotificationClick(notification)}
            style={{ cursor: "pointer" }}
            dangerouslySetInnerHTML={{ __html: notification.message }}
          />
          <button
            type="button"
            className="btn-close"
            onClick={() => markAsRead(notification.id)}
            aria-label="Close"
          />
        </div>
      ))}
    </div>
  );
};

export default Notifications;
