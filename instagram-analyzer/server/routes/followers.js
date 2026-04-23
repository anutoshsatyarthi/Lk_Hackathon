const express = require('express');
const router = express.Router();

module.exports = function (cacheService, demoData, apifyService) {
  router.get('/:username', async (req, res, next) => {
    const { username } = req.params;
    const cacheKey = `network:${username.toLowerCase()}`;

    try {
      const cached = cacheService.get(cacheKey);
      if (cached) return res.json({ ...cached, fromCache: true });

      if (demoData) {
        return res.json({ ...demoData.getNetwork(username), demoMode: true });
      }

      // Use Apify to fetch real followers/following lists
      if (apifyService?.enabled) {
        try {
          console.log(`[Network] Fetching followers/following for @${username} via Apify`);
          const [vvipFollowers, vvipFollowing] = await Promise.all([
            apifyService.getNotableFollowers(username, 500),
            apifyService.getNotableFollowing(username, 500),
          ]);
          const result = { vvipFollowers, vvipFollowing };
          cacheService.set(cacheKey, result, 24 * 60);
          return res.json(result);
        } catch (apifyErr) {
          console.warn(`[Network] Apify failed for @${username}: ${apifyErr.message}`);
        }
      }

      res.json({ vvipFollowing: [], vvipFollowers: [] });
    } catch (err) {
      next(err);
    }
  });

  return router;
};
