const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');

const config = require('./config/env');
const CacheService = require('./services/cache');
const InstagramService = require('./services/instagram');
const AnthropicService = require('./services/anthropic');
const AnalyticsEngine = require('./services/analytics');
const demoData = require('./services/demoData');
const createRateLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

const profileRoutes = require('./routes/profile');
const mediaRoutes = require('./routes/media');
const insightsRoutes = require('./routes/insights');
const followersRoutes = require('./routes/followers');
const analyzeRoutes = require('./routes/analyze');

async function bootstrap() {
  const app = express();

  // ── Security & Middleware ─────────────────────────────────────────────────
  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(cors({ origin: config.server.corsOrigin, credentials: true }));
  app.use(express.json({ limit: '2mb' }));
  app.use(morgan('dev'));
  app.use(createRateLimiter(config));

  // ── Services Init ─────────────────────────────────────────────────────────
  const cacheService = new CacheService(path.resolve(config.cache.dbPath), config.cache.ttlMinutes);
  const instagramService = new InstagramService(config);
  const anthropicService = new AnthropicService(config);
  const analyticsEngine = new AnalyticsEngine();

  // Determine demo mode
  const demo = config.demoMode ? demoData : null;

  if (config.demoMode) {
    console.log('\n⚠  DEMO MODE ACTIVE — Using mock data for Kusha Kapila');
    console.log('   To use live data, add your Meta API credentials to .env\n');
  } else {
    // Validate Instagram token on startup
    const tokenCheck = await instagramService.checkTokenValidity();
    if (!tokenCheck.valid) {
      console.warn(`\n⚠  Instagram token validation failed: ${tokenCheck.error}`);
      console.warn('   Generate a new token at https://developers.facebook.com/tools/explorer/\n');
    } else {
      console.log(`✓  Instagram token valid (account: ${tokenCheck.name})`);
    }
  }

  // ── Routes ────────────────────────────────────────────────────────────────
  app.use('/api/profile', profileRoutes(instagramService, cacheService, analyticsEngine, demo));
  app.use('/api/media', mediaRoutes(instagramService, cacheService, analyticsEngine, demo));
  app.use('/api/insights', insightsRoutes(instagramService, cacheService, demo));
  app.use('/api/network', followersRoutes(cacheService, demo));
  app.use('/api/analyze', analyzeRoutes(anthropicService, analyticsEngine, cacheService, demo));

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      demoMode: config.demoMode,
      env: config.server.env,
      timestamp: new Date().toISOString(),
    });
  });

  // ── Error Handler ─────────────────────────────────────────────────────────
  app.use(errorHandler);

  // ── Start Server ──────────────────────────────────────────────────────────
  const server = app.listen(config.server.port, () => {
    console.log(`\n🚀 Server running at http://localhost:${config.server.port}`);
    console.log(`   Mode: ${config.server.env}`);
    console.log(`   CORS: ${config.server.corsOrigin}\n`);
  });

  // ── Graceful Shutdown ─────────────────────────────────────────────────────
  process.on('SIGTERM', () => {
    console.log('SIGTERM received — shutting down gracefully');
    server.close(() => {
      cacheService.close();
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    server.close(() => {
      cacheService.close();
      process.exit(0);
    });
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
