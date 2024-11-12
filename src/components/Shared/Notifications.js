import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  getAccessToken,
  isAuthenticated,
} from "../../components/Accounts/Auth";

const Notifications = ({ currentUser }) => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const wsRef = useRef(null);
  const retryAttempts = useRef(0);
  const shouldReconnect = useRef(false);

  useEffect(() => {
    if (!isAuthenticated() && !currentUser) {
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

        wsRef.current = new WebSocket(`/api/notifications?token=${token}`);

        wsRef.current.onopen = () => {
          retryAttempts.current = 0;
          shouldReconnect.current = true;
        };

        wsRef.current.onmessage = (event) => {
          const newNotification = JSON.parse(event.data);
          setNotifications((prev) => [newNotification, ...prev]);
        };

        wsRef.current.onclose = (event) => {
          console.warn(event?.code, event?.reason);
          if (shouldReconnect.current) {
            handleReconnect(); // Attempt to reconnect
          }
        };

        wsRef.current.onerror = (error) => {
          wsRef.current.close();
        };
      } catch (error) {}
    };

    if (isAuthenticated() && currentUser) {
      shouldReconnect.current = true;
      initializeWebSocket();
    }

    // Function to reconnect with exponential backoff
    const handleReconnect = () => {
      if (retryAttempts.current >= 10) {
        console.error("Max WebSocket reconnection attempts reached.");
        shouldReconnect.current = false;
        return;
      }

      const delay = Math.pow(2, retryAttempts.current) * 1000;

      setTimeout(() => {
        if (isAuthenticated() && currentUser && shouldReconnect.current) {
          initializeWebSocket(); // Trigger connection attempt
          retryAttempts.current += 1;
        }
      }, delay);
    };

    return () => {
      shouldReconnect.current = false;
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
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
    <div
      className="position-fixed bottom-0 end-0 p-3"
      id="notification-box"
      style={{ zIndex: 1050 }}
    >
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
