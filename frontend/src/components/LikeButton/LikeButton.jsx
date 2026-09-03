import React, { useState } from "react";
import { Heart } from "lucide-react";
import styles from "./LikeButton.module.css";

const LikeButton = ({ likes = 0, isLiked = false, onLike }) => {
  const [animate, setAnimate] = useState(false);

  const handleClick = () => {
    setAnimate(true);
    if (onLike) {
      onLike();
    }
    // Reset animation state after animation completes
    setTimeout(() => setAnimate(false), 300);
  };

  return (
    <div className={styles.container} onClick={handleClick} role="button" tabIndex={0}>
      <Heart
        className={`${styles.heart} ${animate ? styles.heartLiked : ""} ${isLiked ? styles.heartFilled : ""}`}
        size={22}
        fill={isLiked ? "currentColor" : "none"}
        aria-label={isLiked ? "Unlike" : "Like"}
      />
      <span className={styles.count}>{likes}</span>
    </div>
  );
};

export default React.memo(LikeButton);
