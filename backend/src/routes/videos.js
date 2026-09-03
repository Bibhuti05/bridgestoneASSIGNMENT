import express from 'express';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

const dataDir = join(__dirname, '..', '..', 'data');

const readJSON = (filename) => {
  const filePath = join(dataDir, filename);
  return JSON.parse(readFileSync(filePath, 'utf-8'));
};

const writeJSON = (filename, data) => {
  const filePath = join(dataDir, filename);
  writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Helper to extract user UUID from header, cookie, or body
const getUserUuid = (req) => {
  return (
    req.headers['x-user-uuid'] ||
    req.cookies?.user_uuid ||
    req.body?.userUuid ||
    req.body?.uuid ||
    null
  );
};

// POST /api/user - Register/identify user with UUID
router.post('/user', (req, res) => {
  try {
    const uuid = getUserUuid(req) || req.body?.uuid;

    if (!uuid) {
      return res.status(400).json({ error: 'UUID is required' });
    }

    const users = readJSON('users.json');
    const existingUser = users.find(u => u.uuid === uuid);

    if (existingUser) {
      existingUser.lastActive = new Date().toISOString();
      writeJSON('users.json', users);
      return res.json({ message: 'User updated', user: existingUser });
    }

    const newUser = {
      uuid,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };

    users.push(newUser);
    writeJSON('users.json', users);

    res.status(201).json({ message: 'User created', user: newUser });
  } catch (error) {
    console.error('Error in POST /user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/videos - Get all videos
router.get('/videos', (req, res) => {
  try {
    const videos = readJSON('videos.json');
    const userUuid = getUserUuid(req);

    if (userUuid) {
      const videosWithUserLikes = videos.map(video => ({
        ...video,
        isLiked: video.likedBy.includes(userUuid)
      }));
      return res.json(videosWithUserLikes);
    }

    res.json(videos);
  } catch (error) {
    console.error('Error in GET /videos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/like - Like/unlike a video
router.post('/like', (req, res) => {
  try {
    const { videoId } = req.body;
    const userUuid = getUserUuid(req);

    if (!userUuid) {
      return res.status(401).json({ error: 'User not identified' });
    }

    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    const videos = readJSON('videos.json');
    const videoIndex = videos.findIndex(v => v.id === videoId);

    if (videoIndex === -1) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const video = videos[videoIndex];
    const userLikeIndex = video.likedBy.indexOf(userUuid);

    if (userLikeIndex === -1) {
      video.likedBy.push(userUuid);
      video.likes += 1;
    } else {
      video.likedBy.splice(userLikeIndex, 1);
      video.likes -= 1;
    }

    videos[videoIndex] = video;
    writeJSON('videos.json', videos);

    res.json({
      likes: video.likes,
      isLiked: userLikeIndex === -1
    });
  } catch (error) {
    console.error('Error in POST /like:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/share - Track a share
router.post('/share', (req, res) => {
  try {
    const { videoId, platform } = req.body;
    const userUuid = getUserUuid(req);

    if (!userUuid) {
      return res.status(401).json({ error: 'User not identified' });
    }

    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    const videos = readJSON('videos.json');
    const videoIndex = videos.findIndex(v => v.id === videoId);

    if (videoIndex === -1) {
      return res.status(404).json({ error: 'Video not found' });
    }

    videos[videoIndex].shares += 1;
    writeJSON('videos.json', videos);

    res.json({
      shares: videos[videoIndex].shares,
      platform: platform || 'copy_link'
    });
  } catch (error) {
    console.error('Error in POST /share:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
