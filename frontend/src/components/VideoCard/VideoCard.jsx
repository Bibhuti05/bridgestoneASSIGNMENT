import React, { useRef, useState, useEffect, useCallback } from 'react';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';
import VideoControls from '../VideoControls/VideoControls';
import LikeButton from '../LikeButton/LikeButton';
import ShareButton from '../ShareButton/ShareButton';
import ProductCard from '../ProductCard/ProductCard';
import styles from './VideoCard.module.css';

const VideoCard = ({ video, onLike, onShare, isActive = true, videoIndex = 0 }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const shouldAutoplayRef = useRef(false);
  const lastProgressUpdateRef = useRef(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const tryPlay = useCallback(async () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    try {
      await videoEl.play();
      if (videoEl.muted) setIsMuted(true);
    } catch {
      try {
        videoEl.muted = true;
        setIsMuted(true);
        await videoEl.play();
      } catch {}
    }
  }, []);

  // Lazy-load src via IntersectionObserver
  useEffect(() => {
    const videoEl = videoRef.current;
    const containerEl = containerRef.current;
    if (!videoEl || !containerEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (videoEl.src !== video.url) {
              videoEl.src = video.url;
              videoEl.load();
            }
          } else {
            videoEl.pause();
            videoEl.currentTime = 0;
            setProgress(0);
          }
        });
      },
      { threshold: 0.3, rootMargin: '120px' }
    );

    observer.observe(containerEl);
    return () => observer.unobserve(containerEl);
  }, [video.url]);

  // Auto-play when active, pause when not
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (isActive) {
      if (videoEl.readyState >= 2) {
        tryPlay();
      } else {
        shouldAutoplayRef.current = true;
        if (!videoEl.src || videoEl.src !== video.url) {
          videoEl.src = video.url;
          videoEl.load();
        }
      }
    } else {
      shouldAutoplayRef.current = false;
      videoEl.pause();
    }
  }, [isActive, tryPlay, video.url]);

  const handlePlay  = useCallback(() => setIsPlaying(true), []);
  const handlePause = useCallback(() => setIsPlaying(false), []);

  const handleCanPlay = useCallback(() => {
    setIsLoading(false);
    if (shouldAutoplayRef.current && isActive) {
      shouldAutoplayRef.current = false;
      tryPlay();
    }
  }, [isActive, tryPlay]);

  const handleWaiting = useCallback(() => setIsLoading(true), []);

  // Throttle progress state updates to ~4 times/sec to prevent 30fps React re-render storms
  const handleTimeUpdate = useCallback(() => {
    const videoEl = videoRef.current;
    if (!videoEl || !videoEl.duration) return;
    const now = performance.now();
    if (now - lastProgressUpdateRef.current > 220 || videoEl.currentTime >= videoEl.duration) {
      lastProgressUpdateRef.current = now;
      setProgress((videoEl.currentTime / videoEl.duration) * 100);
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    videoEl.paused ? tryPlay() : videoEl.pause();
  }, [tryPlay]);

  const toggleMute = useCallback(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    videoEl.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleLikeClick = useCallback(() => {
    onLike?.(video.id);
  }, [onLike, video.id]);

  const handleShareClick = useCallback((platform) => {
    onShare?.(video.id, platform);
  }, [onShare, video.id]);

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${!isActive ? styles.containerInactive : ''}`}
    >
      <video
        ref={videoRef}
        className={styles.video}
        poster={video.thumbnailUrl}
        onClick={isActive ? togglePlayPause : undefined}
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
        onWaiting={handleWaiting}
        onCanPlay={handleCanPlay}
        playsInline
        loop
        preload={isActive ? 'auto' : 'none'}
      />

      {isLoading && isActive && (
        <div className={styles.loadingContainer}>
          <LoadingSpinner />
        </div>
      )}

      <div className={styles.overlay}>
        <div className={styles.title}>{video.title}</div>

        {isActive && (
          <div className={styles.actions}>
            <LikeButton
              likes={video.likes}
              isLiked={video.isLiked}
              onLike={handleLikeClick}
            />
            <ShareButton
              videoId={video.id}
              onShare={handleShareClick}
            />
          </div>
        )}

        {isActive && <ProductCard videoIndex={videoIndex} />}

        <div className={styles.controls}>
          {isActive ? (
            <VideoControls
              isPlaying={isPlaying}
              isMuted={isMuted}
              progress={progress}
              onPlayPause={togglePlayPause}
              onMuteToggle={toggleMute}
            />
          ) : (
            <div className={styles.tapHint}>Tap to view</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(VideoCard);
