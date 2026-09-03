import React, { useState, useRef, useEffect } from "react";
import { Share2, Copy, ExternalLink } from "lucide-react";
import styles from "./ShareButton.module.css";

const ShareButton = ({ videoId, onShare }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const dropdownRef = useRef(null);

  // Build a proper deep-link: ?v=<videoId> so recipients land directly on this video
  const videoUrl = typeof window !== "undefined"
    ? `${window.location.origin}${window.location.pathname}?v=${videoId}`
    : `?v=${videoId}`;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(videoUrl);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = videoUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
    setIsOpen(false);
    if (onShare) {
      onShare("copy");
    }
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(videoUrl)}&text=${encodeURIComponent("Check out this video!")}`;
    window.open(twitterUrl, "_blank", "width=600,height=400");
    setIsOpen(false);
    if (onShare) {
      onShare("twitter");
    }
  };

  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Check out this video! ${videoUrl}`)}`;
    window.open(whatsappUrl, "_blank");
    setIsOpen(false);
    if (onShare) {
      onShare("whatsapp");
    }
  };

  const toggleDropdown = (e) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  return (
    <div className={styles.container} ref={dropdownRef}>
      <button className={styles.shareButton} onClick={toggleDropdown} aria-label="Share">
        <Share2 size={18} />
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <button className={styles.dropdownItem} onClick={handleCopyLink}>
            <Copy size={16} />
            <span>Copy Link</span>
          </button>
          <button className={styles.dropdownItem} onClick={handleTwitterShare}>
            <ExternalLink size={16} />
            <span>Twitter</span>
          </button>
          <button className={styles.dropdownItem} onClick={handleWhatsAppShare}>
            <ExternalLink size={16} />
            <span>WhatsApp</span>
          </button>
        </div>
      )}

      {showToast && <div className={styles.toast}>Copied!</div>}
    </div>
  );
};

export default ShareButton;
