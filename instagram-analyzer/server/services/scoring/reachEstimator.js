class ReachEstimator {
  estimate(profileData, mediaData, campaignConfig, scores) {
    const followers = profileData.followers || 1;
    const posts = mediaData.posts || [];
    const numPosts = campaignConfig.numPosts || 1;
    const fmt = (campaignConfig.contentFormat || 'reel').toLowerCase();
    const integrationLevel = campaignConfig.integrationLevel || 'moderate';

    // Step 1: Base reach per post
    const reels = posts.filter(p => p.media_type === 'VIDEO' || p.media_product_type === 'REELS');
    const avgReelViews = reels.length ? reels.reduce((s,p) => s + (p.insights?.video_views || 0), 0) / reels.length : 0;
    const avgLikes = posts.length ? posts.reduce((s,p) => s + (p.like_count||0), 0) / posts.length : 0;

    let baseReach;
    const naturalReach = followers * this._reachRate(followers);
    if (fmt === 'reel' || fmt === 'story') {
      // Use reel views as a quality signal but cap at 2x natural reach.
      // Organic viral reels can hit millions of views, but sponsored content
      // does not replicate that — Instagram limits paid/branded reach.
      const sponsoredCap = naturalReach * 2.0;
      baseReach = avgReelViews > 0 ? Math.min(avgReelViews, sponsoredCap) : naturalReach;
    } else if (fmt === 'carousel') {
      baseReach = avgLikes * 4.5;
    } else {
      baseReach = avgLikes * 3.5;
    }
    if (baseReach < followers * 0.08) baseReach = followers * 0.10; // floor at 10% of followers

    // Step 2: Sponsorship decay
    const decayMap = { deep: 0.85, moderate: 0.70, light: 0.55, story: 0.40 };
    const decayFactor = decayMap[integrationLevel] || 0.70;

    // Step 3: Brand fit multiplier
    const brandFitMultiplier = 0.7 + (scores.affnScore?.overall || 0.65) * 0.43;

    const sponsoredReachPerPost = Math.round(baseReach * decayFactor * brandFitMultiplier);

    // Step 4: Multi-post diminishing returns
    const postMultipliers = [1.0, 0.70, 0.50, 0.35, 0.28, 0.22];
    let totalReach = 0;
    const reachBreakdown = {};
    for (let i = 0; i < numPosts; i++) {
      const m = postMultipliers[Math.min(i, postMultipliers.length-1)];
      const r = Math.round(sponsoredReachPerPost * m);
      reachBreakdown[`post${i+1}`] = r;
      totalReach += r;
    }

    // Step 5: Viral boost
    const shareRate = 0.04; // estimated
    const viralBoost = 1 + (shareRate * 1.5);
    const totalWithViral = Math.round(totalReach * viralBoost);

    // Step 6: Unique reach (deduplicated)
    const overlapFactor = numPosts > 1 ? 0.85 : 1.0;
    const uniqueReach = Math.round(totalWithViral * overlapFactor);

    // Confidence intervals
    const engScore = scores.engScore?.overall || 0.5;
    const uncertainty = 1 - engScore * 0.5;
    return {
      baseReachPerPost: Math.round(baseReach),
      sponsoredReachPerPost,
      totalCampaignReach: totalWithViral,
      uniqueReach,
      viralUpsidePotential: Math.round(totalReach * 0.25),
      reachBreakdown,
      confidenceInterval: {
        low: Math.round(uniqueReach * (1 - uncertainty * 0.4)),
        expected: uniqueReach,
        high: Math.round(uniqueReach * (1 + uncertainty * 0.5)),
      },
      benchmarkComparison: {
        vsCategoryAvg: `${((sponsoredReachPerPost / (followers * 0.20) - 1) * 100).toFixed(0)}%`,
        decayApplied: `${Math.round((1-decayFactor)*100)}% sponsorship discount applied`,
      },
    };
  }

  _reachRate(followers) {
    if (followers > 5_000_000) return 0.08;
    if (followers > 1_000_000) return 0.12;
    if (followers > 500_000)   return 0.18;
    if (followers > 100_000)   return 0.25;
    if (followers > 50_000)    return 0.35;
    return 0.45;
  }
}

module.exports = ReachEstimator;
