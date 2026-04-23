const express = require('express');
const router = express.Router();

module.exports = function (instagramService, cacheService, demoData) {
  router.get('/:username', async (req, res, next) => {
    const { username } = req.params;
    const cacheKey = `insights:${username.toLowerCase()}`;

    try {
      const cached = cacheService.get(cacheKey);
      if (cached) return res.json({ ...cached, fromCache: true });

      if (demoData) {
        return res.json({ ...demoData.getInsights(username), demoMode: true });
      }

      // Account insights only work for your own IG account, not discovered ones
      const since = Math.floor(Date.now() / 1000) - 30 * 86400;
      const until = Math.floor(Date.now() / 1000);
      const data = await instagramService.getAccountInsights(null, since, until);

      cacheService.set(cacheKey, data, 60);
      res.json(data);
    } catch (err) {
      next(err);
    }
  });

  return router;
};
