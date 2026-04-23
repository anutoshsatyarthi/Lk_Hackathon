class ContentScorer {
  score(mediaData, campaignConfig = {}) {
    const posts = mediaData.posts || [];
    if (!posts.length) return this._empty();

    const reels = posts.filter(p => p.media_type === 'VIDEO' || p.media_product_type === 'REELS');
    const images = posts.filter(p => p.media_type === 'IMAGE');
    const carousels = posts.filter(p => p.media_type === 'CAROUSEL_ALBUM');
    const followers = mediaData.followers || 1;

    const avgEng = (arr) => arr.length ? arr.reduce((s,p) => s + (p.like_count||0) + (p.comments_count||0), 0) / arr.length : 0;
    const reelEng = avgEng(reels) / followers;
    const imageEng = avgEng(images) / followers;
    const carouselEng = avgEng(carousels) / followers;

    // Sub-score 1: Format effectiveness (weight 0.30)
    const fmt = (campaignConfig.contentFormat || 'reel').toLowerCase();
    const fmtRateMap = { reel: reelEng, image: imageEng, carousel: carouselEng, story: reelEng * 0.6, mix: Math.max(reelEng, imageEng, carouselEng) };
    const chosenRate = fmtRateMap[fmt] || Math.max(reelEng, imageEng, 0.01);
    const maxRate = Math.max(reelEng, imageEng, carouselEng, 0.001);
    const formatScore = maxRate > 0 ? Math.min(1, chosenRate / maxRate) : 0.5;

    // Sub-score 2: Posting consistency (weight 0.20)
    if (posts.length >= 2) {
      const sorted = [...posts].sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
      const newest = new Date(sorted[0].timestamp);
      const oldest = new Date(sorted[sorted.length-1].timestamp);
      const daySpan = Math.max(1, (newest - oldest) / 86400000);
      const postsPerWeek = (posts.length / daySpan) * 7;
      var consistencyScore = postsPerWeek > 5 ? 1.0 : postsPerWeek > 3 ? 0.8 : postsPerWeek > 1 ? 0.5 : 0.2;
      var postsPerWeekVal = postsPerWeek;
    } else {
      var consistencyScore = 0.4;
      var postsPerWeekVal = 0;
    }

    // Sub-score 3: Caption & CTA effectiveness (weight 0.20)
    const allCaptions = posts.map(p => p.caption || '');
    const avgLen = allCaptions.reduce((s,c) => s+c.length, 0) / Math.max(1, allCaptions.length);
    const ctaWords = ['link in bio','swipe','comment below','tag','save this','dm me','use code','shop now','click','check out'];
    const questionCount = allCaptions.filter(c => c.includes('?')).length;
    const ctaCount = allCaptions.filter(c => ctaWords.some(w => c.toLowerCase().includes(w))).length;
    const ctaRatio = ctaCount / Math.max(1, posts.length);
    const captionScore = Math.min(1, (avgLen > 100 ? 0.3 : 0.1) + (ctaRatio > 0.5 ? 0.4 : ctaRatio > 0.2 ? 0.25 : 0.1) + (questionCount/posts.length > 0.3 ? 0.3 : 0.15));

    // Sub-score 4: Visual quality (weight 0.15)
    const hasHighRes = posts.some(p => p.media_url || p.thumbnail_url);
    const avgCarouselDepth = carousels.length > 0 ? 4 : 0; // estimate
    const reelDurationOk = reels.length > 0; // can't know exact duration, credit for having reels
    const visualScore = hasHighRes ? (reelDurationOk ? 0.85 : 0.70) : 0.50;

    // Sub-score 5: Hashtag strategy (weight 0.15)
    const hashtags = mediaData.hashtags || [];
    const hashCount = hashtags.length;
    const hashScore = hashCount > 15 ? 1.0 : hashCount > 10 ? 0.8 : hashCount > 5 ? 0.6 : hashCount > 0 ? 0.4 : 0.2;

    const overall = formatScore*0.30 + consistencyScore*0.20 + captionScore*0.20 + visualScore*0.15 + hashScore*0.15;

    return {
      overall: parseFloat(overall.toFixed(3)),
      grade: this._grade(overall),
      label: this._label(overall),
      breakdown: {
        formatEffectiveness: { score: parseFloat(formatScore.toFixed(3)), value: `${Math.round(formatScore*100)}% match`, detail: `Requested ${fmt} vs best format`, weight: 0.30 },
        postingConsistency: { score: consistencyScore, value: `${postsPerWeekVal.toFixed(1)}/week`, detail: '> 3/week = good for algorithm', weight: 0.20 },
        captionCTA: { score: parseFloat(captionScore.toFixed(3)), value: `${Math.round(ctaRatio*100)}% CTA rate`, detail: `Avg caption length: ${Math.round(avgLen)} chars`, weight: 0.20 },
        visualQuality: { score: visualScore, value: hasHighRes ? 'Good' : 'Basic', detail: 'Production value estimate', weight: 0.15 },
        hashtagStrategy: { score: hashScore, value: `${hashCount} unique tags`, detail: '10-20 unique hashtags is optimal', weight: 0.15 },
      },
      insights: this._insights(formatScore, postsPerWeekVal, ctaRatio, hashCount, fmt),
    };
  }

  _insights(fmt, ppw, cta, hash, requestedFmt) {
    const out = [];
    if (fmt > 0.8) out.push(`Content format aligns well with requested ${requestedFmt} campaign`);
    else out.push(`Consider ${requestedFmt} — this creator's best format differs, may need briefing`);
    if (ppw > 3) out.push(`${ppw.toFixed(1)} posts/week — active creator, algorithm has good momentum`);
    if (cta > 0.4) out.push('Strong CTA game — audience is trained to take action on posts');
    if (hash < 10) out.push('Limited hashtag usage — recommend expanding reach via hashtag strategy');
    return out.slice(0,3);
  }

  _grade(s) {
    if (s > 0.85) return 'A+'; if (s > 0.75) return 'A'; if (s > 0.65) return 'B+';
    if (s > 0.55) return 'B'; if (s > 0.45) return 'C+'; if (s > 0.35) return 'C'; return 'D';
  }

  _label(s) {
    if (s > 0.80) return 'Excellent content quality'; if (s > 0.65) return 'Strong content quality';
    if (s > 0.50) return 'Average content quality'; return 'Below-average content quality';
  }

  _empty() { return { overall: 0.4, grade: 'C', label: 'Insufficient data', breakdown: {}, insights: ['Insufficient post data'] }; }
}

module.exports = ContentScorer;
