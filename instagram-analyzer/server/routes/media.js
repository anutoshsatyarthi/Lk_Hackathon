const express = require('express');
const router = express.Router();

module.exports = function (instagramService, cacheService, analyticsEngine, demoData, demoFallback) {
  router.get('/:username', async (req, res, next) => {
    const { username } = req.params;
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);
    const cacheKey = `media:${username.toLowerCase()}:${limit}`;

    try {
      const cached = cacheService.get(cacheKey);
      if (cached) {
        console.log(`[Media] Cache hit for ${username}`);
        return res.json({ ...cached, fromCache: true });
      }

      if (demoData) {
        return res.json({ ...demoData.getMedia(username), demoMode: true });
      }

      try {
        const discovery = await instagramService.discoverBusiness(username);
        const posts = (discovery.media?.data || []).slice(0, limit);

        const postTypes = analyticsEngine.computePostTypeBreakdown(posts);
        const hashtags = analyticsEngine.computeHashtagFrequency(posts);
        const topPosts = analyticsEngine.computeTopPosts(posts, 5);
        const engagementTrends = analyticsEngine.computeEngagementTrends(posts);
        const postingPatterns = analyticsEngine.computePostingPatterns(posts);

        const result = { posts, postTypes, hashtags, topPosts, engagementTrends, postingPatterns };
        cacheService.set(cacheKey, result, 30);
        res.json(result);
      } catch (apiErr) {
        console.warn(`[Media] Live API failed for ${username}, falling back to demo data: ${apiErr.message}`);
        const fallback = demoFallback || demoData;
        const demo = fallback ? fallback.getMedia(username) : null;
        if (demo) return res.json({ ...demo, demoMode: true });
        next(apiErr);
      }
    } catch (err) {
      next(err);
    }
  });

  return router;
};
