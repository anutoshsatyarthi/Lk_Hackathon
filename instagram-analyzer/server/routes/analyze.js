const express = require('express');
const router = express.Router();
const AudienceScorer = require('../services/scoring/audienceScore');

const audienceScorer = new AudienceScorer();

module.exports = function (anthropicService, analyticsEngine, cacheService, demoData, apifyService, brandDetector) {
  router.post('/', async (req, res, next) => {
    const { username, posts = [], profile = {} } = req.body;
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

      // Run brand detection, engagement analysis, and comment sentiment in parallel
      const [brandResult, insights, sentiment] = await Promise.all([
        brandDetector
          ? brandDetector.detectBrandCollabs(username, posts)
          : anthropicService.classifyBrandCollabs(posts).then((c) => ({ classifications: c, syntheticPosts: [] })),
        anthropicService.analyzeEngagementPatterns(posts),
        anthropicService.analyzeCommentSentiment(posts),
      ]);

      const { classifications: brandClassifications, syntheticPosts = [] } = brandResult;
      const allPosts = [...posts, ...syntheticPosts];
      const brands = analyticsEngine.computeBrandEngagement(allPosts, brandClassifications);

      // Compute audience demographics estimates from post signals
      const profileData = { followers: profile.followers_count || profile.followers || 0 };
      const mediaData = {
        posts,
        hashtags: [],
        engagementRate: profile.engagementRate || 0,
      };
      const audienceEstimates = audienceScorer.score(profileData, mediaData, {});

      console.log(`[Analyze] Brands found: ${brands.length}`);

      const result = { brands, insights, sentiment, audienceEstimates };
      cacheService.set(cacheKey, result, 24 * 60);
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  return router;
};
