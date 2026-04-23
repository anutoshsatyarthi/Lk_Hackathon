const express = require('express');
const router = express.Router();

module.exports = function (anthropicService, analyticsEngine, cacheService, demoData) {
  router.post('/', async (req, res, next) => {
    const { username, posts = [] } = req.body;
    if (!username) return res.status(400).json({ error: 'username is required' });

    const cacheKey = `analysis:${username.toLowerCase()}`;

    try {
      const cached = cacheService.get(cacheKey);
      if (cached) {
        console.log(`[Analyze] Cache hit for ${username}`);
        return res.json({ ...cached, fromCache: true });
      }

      if (demoData) {
        return res.json({ ...demoData.getAnalysis(username), demoMode: true });
      }

      // 1. Classify brand collaborations in post captions
      const brandClassifications = await anthropicService.classifyBrandCollabs(posts);

      // 2. Compute per-brand engagement metrics
      const brands = analyticsEngine.computeBrandEngagement(posts, brandClassifications);

      // 3. Analyze engagement patterns
      const insights = await anthropicService.analyzeEngagementPatterns(posts);

      // 4. VVIP detection — uses AI to classify known accounts
      // In a real scenario this would come from a following/followers list
      // For discovered accounts, we use the demo VVIP list enriched by AI
      const vvipFollowing = [];
      const vvipFollowers = [];

      const result = { brands, vvipFollowing, vvipFollowers, insights };
      cacheService.set(cacheKey, result, 24 * 60); // 24 hours
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  return router;
};
