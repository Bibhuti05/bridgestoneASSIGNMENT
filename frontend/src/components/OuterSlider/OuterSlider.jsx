import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Heart } from 'lucide-react';
import styles from './OuterSlider.module.css';

const OuterSlider = React.memo(function OuterSlider({ videos = [], onVideoClick }) {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollBy({ left: direction === 'left' ? -260 : 260, behavior: 'smooth' });
  };

  if (!videos || videos.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>No videos to display</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <button
        className={`${styles.arrow} ${styles.arrowLeft}`}
        onClick={() => scroll('left')}
        aria-label="Scroll left"
      >
        <ChevronLeft size={22} />
      </button>

      <div className={styles.scrollContainer} ref={scrollContainerRef}>
        {videos.map((video, index) => (
          <div
            key={video.id}
            className={styles.card}
            onClick={() => onVideoClick && onVideoClick(video)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onVideoClick && onVideoClick(video)}
            aria-label={`Play ${video.title}`}
          >
            {/* Thumbnail */}
            <div className={styles.thumbnailWrapper}>
              <img
                className={styles.thumbnail}
                src={video.thumbnailUrl}
                alt={video.title}
                loading="lazy"
              />
              {/* Hover overlay with play button */}
              <div className={styles.hoverOverlay}>
                <div className={styles.playIcon}>
                  <Play size={28} fill="white"/>
                </div>
              </div>
              {/* Rank badge */}
              <div className={styles.rank}>#{index + 1}</div>
            </div>

            {/* Info */}
            <div className={styles.cardInfo}>
              <div className={styles.cardTitle}>{video.title}</div>
              <div className={styles.cardMeta}>
                <Heart size={11} className={styles.heartIcon} />
                <span>{video.likes?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        className={`${styles.arrow} ${styles.arrowRight}`}
        onClick={() => scroll('right')}
        aria-label="Scroll right"
      >
        <ChevronRight size={22} />
      </button>
    </div>
  );
});

export default OuterSlider;
