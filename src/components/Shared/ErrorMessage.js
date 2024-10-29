import React, { useState, useEffect } from "react";

const ErrorMessage = ({ message }) => {
  const [visible, setVisible] = useState(true);

  // Reset the visibility whenever a new message is passed
  useEffect(() => {
    setVisible(true); // Ensure visibility is reset whenever message changes
  }, [message]);

  if (!visible || !message) return null; // Hide the error message if dismissed or no message

  return (
    <div
      className="alert alert-danger alert-dismissible fade show"
      role="alert"
      style={{
        maxWidth: "100%",
        display: "inline-block",
        wordWrap: "break-word",
      }}
    >
      {/* Map through the message lines and display each on a new line */}
      {message.split("\n").map((msg, index) => (
        <span key={index}>
          {msg}
          <br />
        </span>
      ))}

      {/* Close button */}
      <button
        type="button"
        className="btn-close"
        aria-label="Close"
        onClick={() => setVisible(false)} // Hide the message when clicked
        style={{ float: "right" }}
      ></button>
    </div>
  );
};

export default ErrorMessage;
