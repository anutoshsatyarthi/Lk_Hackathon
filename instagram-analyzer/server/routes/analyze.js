const express = require('express');
const router = express.Router();

module.exports = function (anthropicService, analyticsEngine, cacheService, demoData, apifyService, brandDetector) {
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

      // Run brand detection, engagement analysis, and VVIP fetch in parallel
      const [brandResult, insights, apifyNetwork] = await Promise.all([
        brandDetector
          ? brandDetector.detectBrandCollabs(username, posts)
          : anthropicService.classifyBrandCollabs(posts).then((c) => ({ classifications: c, syntheticPosts: [] })),
        anthropicService.analyzeEngagementPatterns(posts),
        apifyService?.enabled
          ? Promise.all([
              apifyService.getNotableFollowers(username).catch(() => []),
              apifyService.getNotableFollowing(username).catch(() => []),
            ])
          : Promise.resolve([[], []]),
      ]);

      const { classifications: brandClassifications, syntheticPosts = [] } = brandResult;
      const allPosts = [...posts, ...syntheticPosts];
      const brands = analyticsEngine.computeBrandEngagement(allPosts, brandClassifications);
      const [vvipFollowers, vvipFollowing] = apifyNetwork;

      console.log(`[Analyze] Brands found: ${brands.length}, VVIPs following: ${vvipFollowing.length}, followers: ${vvipFollowers.length}`);

      const result = { brands, vvipFollowing, vvipFollowers, insights };
      cacheService.set(cacheKey, result, 24 * 60);
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  return router;
};
