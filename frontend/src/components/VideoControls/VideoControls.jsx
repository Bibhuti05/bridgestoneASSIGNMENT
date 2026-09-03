import React from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import styles from './VideoControls.module.css';

const VideoControls = ({ isPlaying, isMuted, progress, onPlayPause, onMuteToggle }) => {
  return (
    <div className={styles.container}>
      <button
        className={styles.button}
        onClick={onPlayPause}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
      </button>

      <button
        className={styles.button}
        onClick={onMuteToggle}
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>

      <div className={styles.progressBar}>
        <div
          className={styles.progress}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default React.memo(VideoControls);
