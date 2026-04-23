const EngagementScorer = require('./scoring/engagementScore');
const AudienceScorer = require('./scoring/audienceScore');
const AffluenceScorer = require('./scoring/affluenceScore');
const AffinityScorer = require('./scoring/affinityScore');
const ContentScorer = require('./scoring/contentScore');
const ReachEstimator = require('./scoring/reachEstimator');
const ConversionModel = require('./scoring/conversionModel');

class ROIPredictor {
  constructor() {
    this.engagementScorer = new EngagementScorer();
    this.audienceScorer = new AudienceScorer();
    this.affluenceScorer = new AffluenceScorer();
    this.affinityScorer = new AffinityScorer();
    this.contentScorer = new ContentScorer();
    this.reachEstimator = new ReachEstimator();
    this.conversionModel = new ConversionModel();
  }

  async predict(username, profileData, mediaData, brandCollabs, campaignConfig) {
    // Normalize campaign config
    const config = {
      fee: campaignConfig.fee || 100000,
      numPosts: campaignConfig.numPosts || 2,
      contentFormat: campaignConfig.contentFormat || 'reel',
      productCategory: campaignConfig.productCategory || 'eyewear',
      aov: campaignConfig.aov || 3500,
      profitMargin: campaignConfig.profitMargin || 0.40,
      hasDiscountCode: campaignConfig.hasDiscountCode || false,
      discountPercent: campaignConfig.discountPercent || 15,
      hasVirtualTryOn: campaignConfig.hasVirtualTryOn || true,
      integrationLevel: campaignConfig.integrationLevel || 'moderate',
      durationDays: { '1week': 7, '2weeks': 14, '1month': 30 }[campaignConfig.duration] || 14,
    };

    // Normalize data for scorers
    const profile = {
      followers: profileData.followers_count || profileData.followers || 0,
      following: profileData.follows_count || profileData.following || 0,
      mediaCount: profileData.media_count || 0,
      username,
    };

    const media = {
      posts: mediaData.posts || [],
      postTypes: mediaData.postTypes || [],
      engagementTrends: mediaData.engagementTrends || [],
      hashtags: mediaData.hashtags || [],
      engagementRate: mediaData.metrics?.engagementRate || mediaData.engagementRate || 2.0,
      followers: profile.followers,
      brands: brandCollabs || [],
    };

    // Run all 5 scoring models (sync — no I/O)
    const engScore = this.engagementScorer.score(profile, media);
    const audScore = this.audienceScorer.score(profile, media, {});
    const affcScore = this.affluenceScorer.score(profile, media, {});
    const affnScore = this.affinityScorer.score(profile, media, brandCollabs || [], config);
    const contScore = this.contentScorer.score(media, config);

    // Composite score (weighted)
    const compositeScore = parseFloat((
      engScore.overall  * 0.25 +
      audScore.overall  * 0.20 +
      affcScore.overall * 0.15 +
      affnScore.overall * 0.25 +
      contScore.overall * 0.15
    ).toFixed(3));

    // Reach estimation
    const reachEstimate = this.reachEstimator.estimate(profile, media, config, { engScore, affnScore });

    // Conversion model
    const conversion = this.conversionModel.predict(reachEstimate, { engScore, affnScore, contScore, affcScore }, config);

    // Recommendation
    const recommendation = this._recommend(compositeScore, conversion, affnScore.dealBreakers || []);

    // Risks
    const risks = this._assessRisks({ engScore, audScore, affcScore, affnScore, contScore }, conversion, config);

    // Recommendations
    const recs = this._generateRecs({ engScore, audScore, affcScore, affnScore, contScore }, conversion, config);

    // Grade
    const compositeGrade = this._grade(compositeScore);

    return {
      generatedAt: new Date().toISOString(),
      influencer: { username, followers: profile.followers, following: profile.following },
      campaign: config,
      executiveSummary: {
        compositeScore,
        compositeGrade,
        recommendation: recommendation.verdict,
        recommendationReason: recommendation.reason,
        expectedROI: conversion.roi.expected,
        expectedROAS: conversion.roas.expected,
        expectedPurchases: conversion.funnel.purchases.expected,
        expectedRevenue: conversion.revenue.expected,
        confidenceLevel: compositeScore > 0.70 ? 'High' : compositeScore > 0.50 ? 'Medium' : 'Low',
      },
      scores: { engagement: engScore, audience: audScore, affluence: affcScore, affinity: affnScore, content: contScore },
      reach: reachEstimate,
      conversion,
      risks,
      recommendations: recs,
    };
  }

  _recommend(score, conversion, dealBreakers) {
    if (dealBreakers.length > 0) return { verdict: 'NO-GO', reason: dealBreakers[0] };
    const roi = conversion.roi.expected;
    if (score > 0.78 && roi > 80)  return { verdict: 'STRONG GO', reason: `Composite score ${(score*100).toFixed(0)}/100 with expected ${roi}% ROI — strong alignment across all dimensions` };
    if (score > 0.62 && roi > 20)  return { verdict: 'GO', reason: `Good influencer-brand fit with positive expected ROI of ${roi}%` };
    if (score > 0.48 && roi > -20) return { verdict: 'CONDITIONAL', reason: `Moderate fit — negotiate performance-based pricing to de-risk the ${roi < 0 ? 'negative' : 'low'} ROI scenario` };
    return { verdict: 'NO-GO', reason: `Low composite score (${(score*100).toFixed(0)}/100) and unfavorable financial projections` };
  }

  _assessRisks({ engScore, audScore, affcScore, affnScore, contScore }, conversion, config) {
    const risks = [];
    if ((affnScore.dealBreakers || []).length > 0) {
      risks.push({ severity: 'CRITICAL', factor: 'Competitor conflict', detail: affnScore.dealBreakers[0], mitigation: 'Include 6-month eyewear category exclusivity clause in contract' });
    }
    if (engScore.breakdown.consistency?.score < 0.45) {
      risks.push({ severity: 'HIGH', factor: 'Inconsistent engagement', detail: `Engagement varies widely — actual ROI could be ${Math.abs(conversion.roi.pessimistic - conversion.roi.expected)}% lower than expected`, mitigation: 'Negotiate 50% upfront + 50% performance bonus to de-risk' });
    }
    if (audScore.breakdown.authenticity?.score < 0.65) {
      risks.push({ severity: 'HIGH', factor: 'Audience quality concerns', detail: `Authenticity score ${Math.round(audScore.breakdown.authenticity.score*100)}% — engagement may not translate to real purchases`, mitigation: 'Request Instagram Insights screenshot from creator before contract' });
    }
    if (conversion.roi.pessimistic < -40) {
      risks.push({ severity: 'MEDIUM', factor: 'Downside exposure', detail: `Worst-case ROI is ${conversion.roi.pessimistic}% — significant loss if content underperforms`, mitigation: `Reduce upfront fee to ₹${Math.round(config.fee*0.6).toLocaleString('en-IN')} + performance bonus on tracked orders` });
    }
    if (affcScore.breakdown.audienceTier?.score < 0.45) {
      risks.push({ severity: 'MEDIUM', factor: 'Affordability risk', detail: '₹3,500 AOV may be a stretch purchase for this audience segment', mitigation: 'Lead with ₹1,500-2,000 entry-level products or aggressive discount code to lower barrier' });
    }
    if (contScore.breakdown.postingConsistency?.score < 0.4) {
      risks.push({ severity: 'LOW', factor: 'Low posting frequency', detail: 'Creator posts less than once a week — campaign timing is unpredictable', mitigation: 'Contract should specify exact posting dates and windows' });
    }
    return risks.sort((a,b) => { const o = {CRITICAL:0,HIGH:1,MEDIUM:2,LOW:3}; return o[a.severity]-o[b.severity]; });
  }

  _generateRecs({ engScore, audScore, affcScore, affnScore, contScore }, conversion, config) {
    const recs = [];
    const fmt = config.contentFormat;
    if (fmt !== 'reel' && contScore.breakdown.formatEffectiveness?.score < 0.7) {
      recs.push({ action: 'Switch to Reel format', reason: 'This creator performs best with video content', impact: '+25-40% estimated reach' });
    }
    if (!config.hasDiscountCode) {
      recs.push({ action: 'Include influencer-exclusive discount code (15-20%)', reason: 'Discount codes increase cart rate by ~30% and enable attribution tracking', impact: `+${Math.round(conversion.funnel.purchases.expected * 0.3)} estimated additional purchases` });
    }
    if (!config.hasVirtualTryOn) {
      recs.push({ action: 'Include Virtual Try-On link in caption', reason: "Lenskart's VTO reduces purchase hesitation for glasses", impact: '+15-20% conversion uplift on eyewear/sunglasses' });
    }
    if (config.numPosts > 3) {
      recs.push({ action: `Consider reducing from ${config.numPosts} to 3 posts`, reason: 'Reach has diminishing returns after post 3 — reallocate budget to higher-ROI creators', impact: 'Same reach for lower cost, higher efficiency' });
    }
    if (affnScore.breakdown.contentFit?.value === 'Comedy' || affnScore.breakdown.contentFit?.value === 'Lifestyle') {
      recs.push({ action: 'Request integrated sketch/skit format over product showcase', reason: 'Audience responds to authentic content integration, not product reviews', impact: '+35% engagement on sponsored content vs standard product review' });
    }
    if (config.integrationLevel === 'light') {
      recs.push({ action: "Upgrade to 'Deep' integration level", reason: 'Light integrations get 30% less reach due to less organic sharing', impact: '+20% estimated reach with same post count' });
    }
    recs.push({ action: 'Add UTM tracking to Lenskart campaign URL', reason: 'Attribution data improves future ROI predictions for this creator', impact: 'Full funnel visibility from post to purchase' });
    return recs.slice(0, 6);
  }

  _grade(s) {
    if (s > 0.85) return 'A+'; if (s > 0.75) return 'A'; if (s > 0.65) return 'B+';
    if (s > 0.55) return 'B'; if (s > 0.45) return 'C+'; if (s > 0.35) return 'C'; return 'D';
  }
}

module.exports = ROIPredictor;
