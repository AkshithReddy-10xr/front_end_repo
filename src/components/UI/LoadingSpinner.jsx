import React from "react";
import "./LoadingSpinner.scss";

const LoadingSpinner = ({
  size = "medium",
  message = null,
  color = "primary",
  className = "",
}) => {
  const getSpinnerClass = () => {
    const baseClass = "loading-spinner";
    const classes = [baseClass];

    classes.push(`${baseClass}--${size}`);
    classes.push(`${baseClass}--${color}`);

    if (className) {
      classes.push(className);
    }

    return classes.join(" ");
  };

  return (
    <div className={getSpinnerClass()}>
      <div className="spinner-circle">
        <div className="spinner-inner"></div>
      </div>
      {message && <div className="spinner-message">{message}</div>}
    </div>
  );
};

export default LoadingSpinner;
