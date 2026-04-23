const express = require('express');
const router = express.Router();

module.exports = function (cacheService, demoData) {
  // Note: Instagram Graph API does not expose follower/following lists for discovered accounts.
  // This endpoint returns demo data or data manually enriched by the AI analysis route.
  router.get('/:username', async (req, res, next) => {
    const { username } = req.params;
    const cacheKey = `network:${username.toLowerCase()}`;

    try {
      const cached = cacheService.get(cacheKey);
      if (cached) return res.json({ ...cached, fromCache: true });

      if (demoData) {
        return res.json({ ...demoData.getNetwork(username), demoMode: true });
      }

      // Graph API limitation: follower lists are not accessible via business discovery.
      // Return empty arrays — AI analysis route will populate VVIP data via AI classification.
      res.json({
        note: 'Instagram API does not provide follower/following lists for discovered accounts. Use /api/analyze for VVIP detection.',
        vvipFollowing: [],
        vvipFollowers: [],
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
};
