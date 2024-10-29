import React from "react";
import "../../styles/FlashMessage.css";

const FlashMessage = ({ message }) => {
  return (
    <div id="flash-message" className="flash-message">
      {message}
    </div>
  );
};

export default FlashMessage;
