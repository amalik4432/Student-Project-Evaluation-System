import React from "react";
import "./Button.module.css";

function Button(props) {
  const { children, onClick, type, disabled, className = "" } = props;

  return (
    <button
      className={className}
      type={type}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export default Button;
