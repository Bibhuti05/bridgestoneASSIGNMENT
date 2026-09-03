import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import videosRouter from './routes/videos.js';

if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile();
  } catch {}
}

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

const configuredOrigins = (process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || '')
  .split(',')
  .map(url => url.trim().replace(/\/+$/, ''))
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/+$/, '');

    if (configuredOrigins.includes(normalizedOrigin) || configuredOrigins.includes('*')) {
      return callback(null, true);
    }

    if (
      process.env.NODE_ENV !== 'production' &&
      (/^https?:\/\/localhost(:\d+)?$/.test(normalizedOrigin) || /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(normalizedOrigin))
    ) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked: Origin ${origin} not allowed`));
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-uuid']
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api', videosRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
