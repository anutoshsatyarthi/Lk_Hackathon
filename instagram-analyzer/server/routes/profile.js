const express = require('express');
const router = express.Router();

module.exports = function (instagramService, cacheService, analyticsEngine, demoData) {
  router.get('/:username', async (req, res, next) => {
    const { username } = req.params;
    const cacheKey = `profile:${username.toLowerCase()}`;

    try {
      const cached = cacheService.get(cacheKey);
      if (cached) {
        console.log(`[Profile] Cache hit for ${username}`);
        return res.json({ ...cached, fromCache: true });
      }

      if (demoData) {
        const demo = demoData.getProfile(username);
        return res.json({ ...demo, demoMode: true });
      }

      const profile = await instagramService.discoverBusiness(username);
      const mediaSample = (profile.media?.data || []).slice(0, 50);
      const metrics = analyticsEngine.computeProfileMetrics(profile, mediaSample);

      const result = {
        username: profile.username,
        fullName: profile.name,
        biography: profile.biography,
        website: profile.website,
        profilePicUrl: profile.profile_picture_url,
        followers: profile.followers_count,
        following: profile.follows_count,
        mediaCount: profile.media_count,
        metrics,
      };

      cacheService.set(cacheKey, result, 60);
      res.json(result);
    } catch (err) {
      next(err);
    }
  });

  return router;
};
