import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  getAccessToken,
  isAuthenticated,
} from "../../components/Accounts/Auth";

const Notifications = ({ currentUser }) => {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const navigate = useNavigate();
  const wsRef = useRef(null);
  const retryAttempts = useRef(0);

  // WebSocket reconnection with exponential backoff
  const reconnectWebSocket = useCallback(() => {
    if (retryAttempts.current < 5) {
      const delay = Math.pow(2, retryAttempts.current) * 1000;
      setTimeout(() => {
        console.log("Reconnecting WebSocket...");
        if (isAuthenticated() && currentUser) {
          setIsConnected(false); // Trigger reconnection
        }
      }, delay);
      retryAttempts.current += 1;
    } else {
      console.error("Max WebSocket reconnection attempts reached.");
    }
  }, [currentUser]);

  // Initialize WebSocket connection
  const initializeWebSocket = useCallback(async () => {
    try {
      const token = await getAccessToken();

      if (!token) {
        console.error(
          "Token not available. Unable to establish WebSocket connection."
        );
        return;
      }

      wsRef.current = new WebSocket(`/api/notifications?token=${token}`);

      wsRef.current.onopen = () => {
        console.log("Connected to WebSocket");
        setIsConnected(true);
        retryAttempts.current = 0;
      };

      wsRef.current.onmessage = (event) => {
        const newNotification = JSON.parse(event.data);
        setNotifications((prev) => [newNotification, ...prev]);
      };

      wsRef.current.onclose = () => {
        console.log("WebSocket connection closed");
        setIsConnected(false);
        reconnectWebSocket(); // Attempt to reconnect
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        wsRef.current.close();
      };
    } catch (error) {
      console.error("Error initializing WebSocket:", error);
    }
  }, [reconnectWebSocket]);

  // Effect to initialize WebSocket when currentUser changes
  useEffect(() => {
    if (isAuthenticated() && currentUser && !isConnected) {
      initializeWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        console.log("WebSocket closed on component unmount");
      }
    };
  }, [currentUser, isConnected, initializeWebSocket]);

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
