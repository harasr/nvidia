import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { DEFAULT_LEVELS } from './src/data/defaultLevels.ts';
import { DifficultyLevel, LevelMeta } from './src/types/level.ts';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// In-Memory Database store initialized with default seed levels
let levelsDatabase: LevelMeta[] = [...DEFAULT_LEVELS];

interface ScoreRecord {
  id: string;
  userId: string;
  userName: string;
  levelId: string;
  percentage: number;
  attempts: number;
  timeElapsed: number;
  completed: boolean;
  timestamp: string;
}

let scoresDatabase: ScoreRecord[] = [
  {
    id: 'score_seed_1',
    userId: 'usr_top_1',
    userName: 'VortexMaster',
    levelId: 'lvl_stereo_neon',
    percentage: 100,
    attempts: 4,
    timeElapsed: 18.2,
    completed: true,
    timestamp: '2026-09-12T10:00:00Z',
  },
  {
    id: 'score_seed_2',
    userId: 'usr_top_2',
    userName: 'AcroPulse',
    levelId: 'lvl_stereo_neon',
    percentage: 100,
    attempts: 7,
    timeElapsed: 19.1,
    completed: true,
    timestamp: '2026-09-12T14:30:00Z',
  },
  {
    id: 'score_seed_3',
    userId: 'usr_top_3',
    userName: 'GlitchRider',
    levelId: 'lvl_cyber_drift',
    percentage: 100,
    attempts: 19,
    timeElapsed: 22.4,
    completed: true,
    timestamp: '2026-09-13T09:15:00Z',
  },
  {
    id: 'score_seed_4',
    userId: 'usr_top_1',
    userName: 'VortexMaster',
    levelId: 'lvl_demon_surge',
    percentage: 100,
    attempts: 64,
    timeElapsed: 25.8,
    completed: true,
    timestamp: '2026-09-14T20:00:00Z',
  },
];

// Anti-Cheat Minimum completion time validation factor
const VALIDATION_FACTOR = 0.65;

// ======================== API ROUTES ========================

// 1. Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 2. Levels API: GET /api/levels
app.get('/api/levels', (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit as string) || 12));
    const difficulty = req.query.difficulty as DifficultyLevel | undefined;
    const search = ((req.query.search as string) || '').toLowerCase().trim();
    const sort = (req.query.sort as string) || 'popular';

    let filtered = [...levelsDatabase];

    if (difficulty && Object.values(DifficultyLevel).includes(difficulty)) {
      filtered = filtered.filter((l) => l.difficulty === difficulty);
    }

    if (search) {
      filtered = filtered.filter(
        (l) =>
          l.title.toLowerCase().includes(search) ||
          l.creatorName.toLowerCase().includes(search) ||
          l.songTitle.toLowerCase().includes(search)
      );
    }

    if (sort === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === 'likes') {
      filtered.sort((a, b) => b.likes - a.likes);
    } else {
      // Default: Popular (plays)
      filtered.sort((a, b) => b.plays - a.plays);
    }

    const total = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    res.json({
      levels: paginated,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve levels' });
  }
});

// 3. Single Level API: GET /api/levels/:id
app.get('/api/levels/:id', (req: Request, res: Response) => {
  const level = levelsDatabase.find((l) => l.id === req.params.id);
  if (!level) {
    return res.status(404).json({ error: 'Level not found' });
  }
  // Increment play count
  level.plays++;
  res.json(level);
});

// 4. Create / Publish Level: POST /api/levels
app.post('/api/levels', (req: Request, res: Response) => {
  try {
    const { title, description, levelData, difficulty, starsReward, creatorId, creatorName, isVerified } = req.body;

    // Validation
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: 'Level title is required' });
    }
    if (!levelData || !Array.isArray(levelData.objects)) {
      return res.status(400).json({ error: 'Invalid level data format' });
    }

    // Anti-cheat verification rule: Must be verified by completing it first!
    if (!isVerified) {
      return res.status(400).json({
        error: 'Level must be verified (completed 100% in test play) before publishing to the community!',
      });
    }

    const newLevel: LevelMeta = {
      id: 'lvl_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      title: title.trim().slice(0, 50),
      description: (description || '').slice(0, 200),
      creatorId: creatorId || 'anon_creator',
      creatorName: creatorName || 'Anonymous Builder',
      difficulty: difficulty || DifficultyLevel.MEDIUM,
      starsReward: Math.max(1, Math.min(10, starsReward || 3)),
      songTitle: levelData.settings?.songTitle || 'Custom Beats',
      bpm: levelData.settings?.bpm || 140,
      plays: 1,
      likes: 0,
      isVerified: true,
      levelData,
      createdAt: new Date().toISOString(),
    };

    levelsDatabase.unshift(newLevel);
    res.status(201).json(newLevel);
  } catch (error) {
    res.status(500).json({ error: 'Failed to publish level' });
  }
});

// 5. Like level: POST /api/levels/:id/like
app.post('/api/levels/:id/like', (req: Request, res: Response) => {
  const level = levelsDatabase.find((l) => l.id === req.params.id);
  if (!level) {
    return res.status(404).json({ error: 'Level not found' });
  }
  level.likes++;
  res.json({ success: true, likes: level.likes });
});

// 6. Score & Anti-Cheat Validation: POST /api/levels/:id/score
app.post('/api/levels/:id/score', (req: Request, res: Response) => {
  try {
    const levelId = req.params.id;
    const { userId, userName, percentage, attempts, timeElapsed } = req.body;

    const level = levelsDatabase.find((l) => l.id === levelId);
    if (!level) {
      return res.status(404).json({ error: 'Level not found' });
    }

    // Basic range validation
    if (typeof percentage !== 'number' || percentage < 0 || percentage > 100) {
      return res.status(400).json({ error: 'Invalid percentage value' });
    }
    if (typeof attempts !== 'number' || attempts < 1) {
      return res.status(400).json({ error: 'Invalid attempt count' });
    }

    const isCompleted = percentage >= 100;

    // ANTI-CHEAT CHECK:
    // Calculate level bounds & max possible speed
    let maxX = 1200;
    if (level.levelData?.objects) {
      for (const obj of level.levelData.objects) {
        if (obj.x > maxX) maxX = obj.x;
      }
    }
    // Theoretical minimum time at highest speed (710 px/s)
    const minPhysicalSeconds = (maxX / 710) * VALIDATION_FACTOR;

    if (isCompleted && (typeof timeElapsed !== 'number' || timeElapsed < minPhysicalSeconds)) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'Anti-cheat flag: Completion time is physically impossible for this level distance.',
      });
    }

    // Check existing score
    let existing = scoresDatabase.find((s) => s.userId === userId && s.levelId === levelId);
    let isFirstCompletion = false;
    let starsAwarded = 0;

    if (!existing) {
      existing = {
        id: 'score_' + Date.now(),
        userId: userId || 'guest_user',
        userName: userName || 'Player',
        levelId,
        percentage,
        attempts,
        timeElapsed: timeElapsed || 0,
        completed: isCompleted,
        timestamp: new Date().toISOString(),
      };
      scoresDatabase.push(existing);
      if (isCompleted) {
        isFirstCompletion = true;
        starsAwarded = level.starsReward;
      }
    } else {
      if (percentage > existing.percentage) {
        existing.percentage = percentage;
      }
      existing.attempts += attempts;
      if (isCompleted && !existing.completed) {
        existing.completed = true;
        isFirstCompletion = true;
        starsAwarded = level.starsReward;
      }
      if (timeElapsed && (!existing.timeElapsed || timeElapsed < existing.timeElapsed)) {
        existing.timeElapsed = timeElapsed;
      }
      existing.timestamp = new Date().toISOString();
    }

    res.json({
      success: true,
      verified: true,
      starsAwarded,
      newPercentage: existing.percentage,
      isFirstCompletion,
      attempts: existing.attempts,
      bestTime: existing.timeElapsed,
    });
  } catch (error) {
    res.status(500).json({ error: 'Score submission failed' });
  }
});

// 7. Leaderboards API: GET /api/leaderboard
app.get('/api/leaderboard', (req: Request, res: Response) => {
  try {
    const levelId = req.query.levelId as string | undefined;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit as string) || 15));

    if (levelId) {
      // Level Specific Leaderboard
      const levelScores = scoresDatabase
        .filter((s) => s.levelId === levelId)
        .sort((a, b) => {
          if (b.percentage !== a.percentage) return b.percentage - a.percentage;
          if (a.completed && b.completed && a.timeElapsed && b.timeElapsed) {
            return a.timeElapsed - b.timeElapsed;
          }
          return a.attempts - b.attempts;
        });

      const paginated = levelScores.slice((page - 1) * limit, page * limit).map((s, idx) => ({
        rank: (page - 1) * limit + idx + 1,
        userId: s.userId,
        name: s.userName,
        percentage: s.percentage,
        attempts: s.attempts,
        bestTime: s.timeElapsed,
        completed: s.completed,
      }));

      return res.json({
        leaderboard: paginated,
        total: levelScores.length,
        page,
        totalPages: Math.ceil(levelScores.length / limit),
      });
    }

    // Global Star Leaderboard - full TOP 10 seeded champions
    const userStarMap: Record<string, { name: string; stars: number; secretCoins: number; completedLevels: number }> =
      {
        usr_top_1: { name: 'VortexMaster', stars: 165, secretCoins: 15, completedLevels: 16 },
        usr_top_2: { name: 'AcroPulse', stars: 142, secretCoins: 12, completedLevels: 13 },
        usr_top_3: { name: 'GlitchRider', stars: 128, secretCoins: 10, completedLevels: 11 },
        usr_top_4: { name: 'HyperNova', stars: 115, secretCoins: 8, completedLevels: 9 },
        usr_top_5: { name: 'ShadowDrifter', stars: 98, secretCoins: 7, completedLevels: 8 },
        usr_top_6: { name: 'NeonBlade', stars: 86, secretCoins: 6, completedLevels: 7 },
        usr_top_7: { name: 'QuantumShift', stars: 74, secretCoins: 5, completedLevels: 6 },
        usr_top_8: { name: 'EchoStrike', stars: 65, secretCoins: 4, completedLevels: 5 },
        usr_top_9: { name: 'SolarFlare', stars: 52, secretCoins: 3, completedLevels: 4 },
        usr_top_10: { name: 'CyberThanh', stars: 48, secretCoins: 3, completedLevels: 4 },
      };

    // Calculate aggregated stars from score database
    for (const score of scoresDatabase) {
      if (!userStarMap[score.userId]) {
        userStarMap[score.userId] = {
          name: score.userName,
          stars: 0,
          secretCoins: 1,
          completedLevels: 0,
        };
      }
      if (score.completed) {
        userStarMap[score.userId].completedLevels++;
        const lvl = levelsDatabase.find((l) => l.id === score.levelId);
        userStarMap[score.userId].stars += lvl ? lvl.starsReward : 2;
      }
    }

    const globalRanking = Object.entries(userStarMap)
      .map(([userId, data]) => ({
        userId,
        name: data.name,
        stars: data.stars,
        secretCoins: data.secretCoins,
        completedLevels: data.completedLevels,
      }))
      .sort((a, b) => b.stars - a.stars);

    const paginated = globalRanking.slice((page - 1) * limit, page * limit).map((entry, idx) => ({
      ...entry,
      rank: (page - 1) * limit + idx + 1,
    }));

    res.json({
      leaderboard: paginated,
      total: globalRanking.length,
      page,
      totalPages: Math.ceil(globalRanking.length / limit),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve leaderboard' });
  }
});

// 8. Google OAuth API routes
app.get('/api/auth/google/url', (req: Request, res: Response) => {
  const clientId = process.env.GOOGLE_CLIENT_ID || '1029384756-geometrydashsample.apps.googleusercontent.com';
  const redirectUri = `${req.protocol}://${req.get('host')}/auth/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'token id_token',
    scope: 'openid email profile',
    prompt: 'select_account',
    nonce: Math.random().toString(36).substring(2),
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.json({ url: authUrl, clientId, redirectUri });
});

app.post('/api/auth/google/verify', (req: Request, res: Response) => {
  try {
    const { credential, email, name, picture } = req.body;
    let decodedName = name || 'Google Pilot';
    let decodedEmail = email || 'pilot@gmail.com';
    let decodedPic = picture || '';
    let subId = 'google_' + Date.now();

    if (credential && typeof credential === 'string') {
      try {
        const parts = credential.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
          decodedName = payload.name || payload.given_name || decodedName;
          decodedEmail = payload.email || decodedEmail;
          decodedPic = payload.picture || decodedPic;
          subId = payload.sub || subId;
        }
      } catch (e) {
        console.warn('JWT decode failed, using fallback:', e);
      }
    }

    res.json({
      success: true,
      user: {
        id: subId,
        name: decodedName,
        email: decodedEmail,
        image: decodedPic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces',
        stars: 20,
        secretCoins: 4,
        isGoogleAuth: true,
      },
    });
  } catch (error) {
    res.status(400).json({ error: 'Failed to verify Google token' });
  }
});

// OAuth Popup Callback Handler
app.get(['/auth/callback', '/auth/callback/'], (_req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Google Authentication</title>
        <style>
          body { background: #0D0E15; color: #00F0FF; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        </style>
      </head>
      <body>
        <div>
          <h3>Authenticating with Google...</h3>
          <p>Please wait while your profile synchronizes.</p>
        </div>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', hash: window.location.hash }, '*');
            window.close();
          } else {
            window.location.href = '/';
          }
        </script>
      </body>
    </html>
  `);
});

// ======================== VITE & SERVER SETUP ========================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Geometry Dash Web Studio running on port ${PORT}`);
  });
}

startServer();
