class EngagementScorer {
  score(profileData, mediaData) {
    const posts = mediaData.posts || [];
    const followers = profileData.followers || 1;
    if (!posts.length) return this._empty();

    // Sub-score 1: Raw engagement rate (weight 0.25)
    const totalLikes = posts.reduce((s, p) => s + (p.like_count || 0), 0);
    const totalComments = posts.reduce((s, p) => s + (p.comments_count || 0), 0);
    const rawRate = ((totalLikes + totalComments) / posts.length / followers) * 100;
    const rawRateScore = rawRate > 6 ? 1.0 : rawRate > 3 ? 0.8 : rawRate > 1.5 ? 0.6 : rawRate > 0.5 ? 0.4 : 0.2;

    // Sub-score 2: Engagement consistency (weight 0.20)
    const likes = posts.map(p => p.like_count || 0);
    const mean = likes.reduce((a,b) => a+b, 0) / likes.length;
    const variance = likes.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / likes.length;
    const stdDev = Math.sqrt(variance);
    const consistencyScore = mean > 0 ? Math.max(0, Math.min(1, 1 - (stdDev / mean))) : 0;

    // Sub-score 3: Comment quality ratio (weight 0.15)
    const avgLikes = mean;
    const avgComments = totalComments / posts.length;
    const commentRatio = avgLikes > 0 ? avgComments / avgLikes : 0;
    const commentScore = commentRatio > 0.03 ? 1.0 : commentRatio > 0.02 ? 0.8 : commentRatio > 0.01 ? 0.5 : 0.2;

    // Sub-score 4: Engagement trend (weight 0.15)
    const sorted = [...posts].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
    const recent30 = sorted.slice(0, Math.min(10, Math.floor(sorted.length * 0.33)));
    const older = sorted.slice(Math.floor(sorted.length * 0.33));
    const avg30 = recent30.length ? recent30.reduce((s,p) => s + (p.like_count||0) + (p.comments_count||0), 0) / recent30.length : 0;
    const avg90 = older.length ? older.reduce((s,p) => s + (p.like_count||0) + (p.comments_count||0), 0) / older.length : 0;
    const trend = avg90 > 0 ? (avg30 / avg90) - 1 : 0;
    const trendScore = trend > 0.2 ? 1.0 : trend > 0 ? 0.7 : trend > -0.2 ? 0.4 : 0.1;

    // Sub-score 5: Reel performance (weight 0.15)
    const reels = posts.filter(p => p.media_type === 'VIDEO' || p.media_product_type === 'REELS');
    const avgReelViews = reels.length ? reels.reduce((s,p) => s + (p.insights?.video_views || 0), 0) / reels.length : 0;
    const reelReachRate = followers > 0 ? (avgReelViews / followers) * 100 : 0;
    const reelScore = reelReachRate > 100 ? 1.0 : reelReachRate > 50 ? 0.8 : reelReachRate > 20 ? 0.6 : reelReachRate > 5 ? 0.4 : reels.length === 0 ? 0.5 : 0.2;

    // Sub-score 6: Saves/shares ratio (weight 0.10)
    const avgSaves = posts.reduce((s,p) => s + (p.insights?.saved || 0), 0) / posts.length;
    const estimatedSaves = avgSaves > 0 ? avgSaves : avgLikes * 0.05;
    const estimatedShares = avgLikes * 0.04;
    const saveShareRatio = avgLikes > 0 ? ((estimatedSaves + estimatedShares) / avgLikes) * 100 : 0;
    const saveShareScore = saveShareRatio > 8 ? 1.0 : saveShareRatio > 5 ? 0.8 : saveShareRatio > 3 ? 0.5 : 0.3;

    const overall = rawRateScore*0.25 + consistencyScore*0.20 + commentScore*0.15 + trendScore*0.15 + reelScore*0.15 + saveShareScore*0.10;

    return {
      overall: parseFloat(overall.toFixed(3)),
      grade: this._grade(overall),
      label: this._label(overall),
      breakdown: {
        rawRate: { score: rawRateScore, value: `${rawRate.toFixed(2)}%`, benchmark: '> 6% = exceptional', weight: 0.25 },
        consistency: { score: parseFloat(consistencyScore.toFixed(3)), value: consistencyScore.toFixed(2), benchmark: '> 0.7 = very consistent', weight: 0.20 },
        commentQuality: { score: commentScore, value: commentRatio.toFixed(3), benchmark: '> 0.03 = high intent', weight: 0.15 },
        trend: { score: trendScore, value: `${(trend * 100).toFixed(1)}%`, benchmark: 'Growing MoM', weight: 0.15 },
        reelPerformance: { score: reelScore, value: `${reelReachRate.toFixed(0)}% reach`, benchmark: '> 50% = strong', weight: 0.15 },
        savesShares: { score: saveShareScore, value: `${saveShareRatio.toFixed(1)}%`, benchmark: '> 5% = strong intent', weight: 0.10 },
      },
      insights: this._insights(rawRate, consistencyScore, commentRatio, trend, reelReachRate, reels.length),
    };
  }

  _insights(rawRate, cons, commentRatio, trend, reelReach, reelCount) {
    const out = [];
    if (rawRate > 3) out.push(`Engagement rate of ${rawRate.toFixed(1)}% is above the industry average`);
    else out.push(`Engagement rate of ${rawRate.toFixed(1)}% is below average — audience is less reactive`);
    if (cons > 0.7) out.push('Highly consistent engagement — predictable ROI for brand campaigns');
    else out.push('Inconsistent engagement — some posts over-perform, ROI prediction has wider range');
    if (commentRatio > 0.02) out.push('High comment-to-like ratio signals purchase-intent audience');
    if (trend > 0.1) out.push('Growing engagement trend — audience is expanding, good time to activate');
    if (reelCount > 0 && reelReach > 50) out.push(`Reel reach rate of ${reelReach.toFixed(0)}% — content frequently crosses follower boundary`);
    return out.slice(0, 3);
  }

  _grade(s) {
    if (s > 0.85) return 'A+'; if (s > 0.75) return 'A'; if (s > 0.65) return 'B+';
    if (s > 0.55) return 'B'; if (s > 0.45) return 'C+'; if (s > 0.35) return 'C'; return 'D';
  }

  _label(s) {
    if (s > 0.80) return 'Exceptional engagement quality';
    if (s > 0.65) return 'Strong engagement quality';
    if (s > 0.50) return 'Average engagement quality';
    return 'Below-average engagement';
  }

  _empty() {
    return { overall: 0.3, grade: 'C', label: 'Insufficient data', breakdown: {}, insights: ['Insufficient post data for scoring'] };
  }
}

module.exports = EngagementScorer;
