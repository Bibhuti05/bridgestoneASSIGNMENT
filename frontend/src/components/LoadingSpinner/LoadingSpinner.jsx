import React from "react";
import styles from "./LoadingSpinner.module.css";

const LoadingSpinner = () => {
  return <div className={styles.spinner} aria-label="Loading" />;
};

export default LoadingSpinner;
