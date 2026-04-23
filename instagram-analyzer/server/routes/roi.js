const express = require('express');
const router = express.Router();
const crypto = require('crypto');

module.exports = function(cacheService, roiPredictor) {
  // POST /api/roi/predict/:username
  router.post('/predict/:username', async (req, res, next) => {
    const { username } = req.params;
    const { campaignConfig = {}, profileData = {}, mediaData = {}, brandCollabs = [] } = req.body;

    // Validation
    if (!username) return res.status(400).json({ error: 'username required' });
    if (campaignConfig.fee !== undefined && campaignConfig.fee <= 0) return res.status(400).json({ error: 'fee must be > 0' });
    if (campaignConfig.numPosts !== undefined && (campaignConfig.numPosts < 1 || campaignConfig.numPosts > 20)) return res.status(400).json({ error: 'numPosts must be 1-20' });

    // Cache key from username + config hash
    const configHash = crypto.createHash('md5').update(JSON.stringify(campaignConfig)).digest('hex').slice(0, 8);
    const cacheKey = `roi:${username.toLowerCase()}:${configHash}`;

    try {
      const cached = cacheService.get(cacheKey);
      if (cached) {
        console.log(`[ROI] Cache hit for ${username}`);
        return res.json({ ...cached, fromCache: true });
      }

      console.log(`[ROI] Generating prediction for @${username}`);
      const report = await roiPredictor.predict(username, profileData, mediaData, brandCollabs, campaignConfig);

      cacheService.set(cacheKey, report, 24 * 60); // cache 24h
      res.json(report);
    } catch (err) {
      next(err);
    }
  });

  return router;
};
