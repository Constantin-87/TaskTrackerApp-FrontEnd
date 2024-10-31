// src/components/Notifications.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const baseUrl = `${process.env.REACT_APP_BASE_URL}:${process.env.REACT_APP_API_PORT}`;
  const wsUrl = baseUrl.replace(/^http/, "ws");

  useEffect(() => {
    // WebSocket connection for real-time notifications
    const ws = new WebSocket(`${wsUrl}/api/api/notifications`);

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
  }, [wsUrl]);

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
      const token = sessionStorage.getItem("authToken");
      await axios.put(`${baseUrl}/api/notifications/${notificationId}`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
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
