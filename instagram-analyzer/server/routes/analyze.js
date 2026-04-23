const express = require('express');
const router = express.Router();

module.exports = function (anthropicService, analyticsEngine, cacheService, demoData, apifyService) {
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

      // Run brand classification, engagement analysis, and VVIP fetch in parallel
      const [brandClassifications, insights, apifyNetwork] = await Promise.all([
        anthropicService.classifyBrandCollabs(posts),
        anthropicService.analyzeEngagementPatterns(posts),
        apifyService?.enabled
          ? Promise.all([
              apifyService.getNotableFollowers(username, 500).catch(() => []),
              apifyService.getNotableFollowing(username, 500).catch(() => []),
            ])
          : Promise.resolve([[], []]),
      ]);

      const brands = analyticsEngine.computeBrandEngagement(posts, brandClassifications);
      const [vvipFollowers, vvipFollowing] = apifyNetwork;

      const result = { brands, vvipFollowing, vvipFollowers, insights };
      cacheService.set(cacheKey, result, 24 * 60);
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  return router;
};
