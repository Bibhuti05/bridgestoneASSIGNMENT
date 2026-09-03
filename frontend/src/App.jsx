import { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import ThemeToggle from './components/ThemeToggle/ThemeToggle';
import { initUser } from './utils/uuid';
import { fetchVideos, likeVideo, shareVideo } from './api/videoApi';
import OuterSlider from './components/OuterSlider/OuterSlider';
import InnerSlider from './components/InnerSlider/InnerSlider';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';
import styles from './App.module.css';

const getVideoIdFromUrl = () => new URLSearchParams(window.location.search).get('v');

const pushVideoToUrl = (videoId) => {
  const url = new URL(window.location.href);
  url.searchParams.set('v', videoId);
  window.history.pushState({ videoId }, '', url.toString());
};

const clearVideoFromUrl = () => {
  const url = new URL(window.location.href);
  url.searchParams.delete('v');
  window.history.pushState({}, '', url.toString());
};

function App() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        await initUser();
        const data = await fetchVideos();
        setVideos(data);

        const videoId = getVideoIdFromUrl();
        if (videoId) {
          const idx = data.findIndex((v) => v.id === videoId);
          if (idx !== -1) setSelectedVideoIndex(idx);
        }
      } catch (err) {
        console.error('Failed to initialize:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const handlePop = () => {
      const videoId = getVideoIdFromUrl();
      if (videoId) {
        setVideos((prev) => {
          const idx = prev.findIndex((v) => v.id === videoId);
          if (idx !== -1) setSelectedVideoIndex(idx);
          return prev;
        });
      } else {
        setSelectedVideoIndex(null);
      }
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const handleVideoClick = useCallback((video) => {
    const index = videos.findIndex((v) => v.id === video.id);
    setSelectedVideoIndex(index);
    pushVideoToUrl(video.id);
  }, [videos]);

  const handleCloseModal = useCallback(() => {
    setSelectedVideoIndex(null);
    clearVideoFromUrl();
  }, []);

  const handleActiveVideoChange = useCallback((videoId) => {
    const url = new URL(window.location.href);
    url.searchParams.set('v', videoId);
    window.history.replaceState({ videoId }, '', url.toString());
  }, []);

  const handleLike = useCallback(async (videoId) => {
    try {
      const result = await likeVideo(videoId);
      setVideos((prev) =>
        prev.map((video) =>
          video.id === videoId
            ? { ...video, likes: result.likes, isLiked: result.isLiked }
            : video
        )
      );
    } catch (err) {
      console.error('Failed to like video:', err);
    }
  }, []);

  const handleShare = useCallback(async (videoId, platform) => {
    try {
      const result = await shareVideo(videoId, platform);
      setVideos((prev) =>
        prev.map((video) =>
          video.id === videoId ? { ...video, shares: result.shares } : video
        )
      );
    } catch (err) {
      console.error('Failed to share video:', err);
    }
  }, []);

  if (loading) {
    return (
      <ThemeProvider>
        <div className={styles.appLoading}>
          <LoadingSpinner />
          <p>Loading videos…</p>
        </div>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider>
        <div className={styles.appError}>
          <ThemeToggle />
          <h2>Something went wrong</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className={styles.app}>
        <ThemeToggle />

        <header className={styles.appHeader}>
          <h1>BridgeStone sample video carousel</h1>
          <p>Discover &amp; share trending videos</p>
        </header>

        <main className={styles.appMain}>
          <section className={styles.carouselSection}>
            <h2>Trending Videos</h2>
            <OuterSlider videos={videos} onVideoClick={handleVideoClick} />
          </section>
        </main>

        {selectedVideoIndex !== null && (
          <InnerSlider
            videos={videos}
            initialIndex={selectedVideoIndex}
            onClose={handleCloseModal}
            onLike={handleLike}
            onShare={handleShare}
            onActiveChange={handleActiveVideoChange}
          />
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
