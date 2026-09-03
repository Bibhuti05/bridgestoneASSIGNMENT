import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import VideoCard from '../VideoCard/VideoCard';
import styles from './InnerSlider.module.css';

const VISIBLE_SIDE_COUNT = 2;

const InnerSlider = ({ videos, initialIndex = 0, onClose, onLike, onShare, onActiveChange }) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const isAnimatingRef = useRef(false);
  const touchStartX = useRef(null);

  const navigate = useCallback(
    (direction) => {
      if (isAnimatingRef.current) return;
      isAnimatingRef.current = true;
      setActiveIndex((prev) => {
        const next = prev + direction;
        if (next < 0 || next >= videos.length) return prev;
        onActiveChange?.(videos[next].id);
        return next;
      });
      setTimeout(() => {
        isAnimatingRef.current = false;
      }, 350);
    },
    [videos, onActiveChange]
  );

  const handlePrev = useCallback(() => navigate(-1), [navigate]);
  const handleNext = useCallback(() => navigate(1), [navigate]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, handlePrev, handleNext]);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, []);

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? handleNext() : handlePrev();
    touchStartX.current = null;
  };

  const handleOverlayClick = (e) => { if (e.target === e.currentTarget) onClose(); };

  const getSlotProps = (index) => {
    const offset = index - activeIndex;
    const absOffset = Math.abs(offset);
    if (absOffset > VISIBLE_SIDE_COUNT) return null;

    if (offset === 0) {
      return { isActive: true, translateX: 0, scale: 1, zIndex: 10, opacity: 1, isDimmed: false };
    }
    const sign = offset < 0 ? -1 : 1;
    return {
      isActive: false,
      translateX: sign * (48 * absOffset),
      scale: 1 - 0.18 * absOffset,
      zIndex: 10 - absOffset,
      opacity: 1 - 0.35 * absOffset,
      isDimmed: true,
    };
  };

  const visibleIndices = useMemo(() => {
    const renderRange = VISIBLE_SIDE_COUNT + 1;
    return videos
      .map((_, i) => i)
      .filter((i) => Math.abs(i - activeIndex) <= renderRange);
  }, [videos, activeIndex]);

  return (
    <div
      className={styles.overlay}
      onClick={handleOverlayClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className={styles.modal}>
        <div className={styles.header}>
          <span className={styles.counter}>
            {activeIndex + 1} <span className={styles.counterDivider}>/</span> {videos.length}
          </span>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close modal">
            <X size={22} />
          </button>
        </div>

        <div className={styles.dotsWrapper}>
          {videos.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === activeIndex ? styles.dotActive : ''}`}
              onClick={() => { setActiveIndex(i); onActiveChange?.(videos[i].id); }}
              aria-label={`Go to video ${i + 1}`}
            />
          ))}
        </div>

        <div className={styles.stage}>
          <button
            className={`${styles.arrow} ${styles.arrowLeft}`}
            onClick={handlePrev}
            disabled={activeIndex === 0}
            aria-label="Previous video"
          >
            <ChevronLeft size={24} />
          </button>

          <div className={styles.coverflowTrack}>
            {visibleIndices.map((i) => {
              const slot = getSlotProps(i);
              if (!slot) return null;
              const { isActive, translateX, scale, zIndex, opacity, isDimmed } = slot;

              return (
                <div
                  key={videos[i].id}
                  className={styles.card}
                  style={{
                    transform: `translateX(${translateX}%) scale(${scale})`,
                    zIndex,
                    opacity,
                    filter: isDimmed ? 'brightness(0.65)' : 'none',
                    cursor: isActive ? 'default' : 'pointer',
                  }}
                  onClick={!isActive ? () => { setActiveIndex(i); onActiveChange?.(videos[i].id); } : undefined}
                  aria-hidden={!isActive}
                >
                  <VideoCard
                    video={videos[i]}
                    onLike={onLike}
                    onShare={onShare}
                    isActive={isActive}
                    videoIndex={i}
                  />
                </div>
              );
            })}
          </div>

          <button
            className={`${styles.arrow} ${styles.arrowRight}`}
            onClick={handleNext}
            disabled={activeIndex === videos.length - 1}
            aria-label="Next video"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <div className={styles.titleBar}>
          <h2 className={styles.videoTitle}>{videos[activeIndex]?.title}</h2>
          {videos[activeIndex]?.description && (
            <p className={styles.videoDescription}>{videos[activeIndex].description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InnerSlider;
