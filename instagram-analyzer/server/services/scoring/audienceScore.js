class AudienceScorer {
  score(profileData, mediaData, aiAnalysis = {}) {
    const posts = mediaData.posts || [];
    const hashtags = mediaData.hashtags || [];
    const followers = profileData.followers || 1;

    // Sub-score 1: Geographic match (weight 0.30)
    // Signals: Indian hashtags, Hinglish captions, Indian brand mentions
    const allCaptions = posts.map(p => (p.caption || '').toLowerCase()).join(' ');
    const hashtagText = hashtags.map(h => h.tag || '').join(' ').toLowerCase();
    const indianHashtags = ['mumbai','delhi','bangalore','india','desi','bollywood','ipl','hindi','hinglish','bharat','kolkata','chennai','hyderabad','pune','ahmedabad','jaipur','lucknow','surat','nagpur'];
    const indianBrands = ['flipkart','amazon india','swiggy','zomato','myntra','ajio','paytm','reliance','tata','hdfc','icici','airtel','jio','ola','uber india','nykaa','meesho','bigbasket'];
    const indiaSignals = indianHashtags.filter(h => hashtagText.includes(h) || allCaptions.includes(h)).length;
    const brandSignals = indianBrands.filter(b => allCaptions.includes(b)).length;
    const geoEstimate = Math.min(1, (indiaSignals * 0.05) + (brandSignals * 0.08) + 0.5); // base 50% India
    const geoScore = geoEstimate > 0.9 ? 1.0 : geoEstimate > 0.7 ? 0.8 : geoEstimate > 0.5 ? 0.5 : 0.2;
    const geoPercent = Math.min(98, Math.round(geoEstimate * 100));

    // Sub-score 2: Age group match 18-45 (weight 0.25)
    // Signals: meme culture, Gen-Z slang, professional tone
    const genZWords = ['no cap','fr fr','lowkey','highkey','vibe','slay','bro','bestie','okk','lol','omg','bruh','simp','based'];
    const professionalWords = ['career','office','work','meeting','team','project','deadline','salary','invest','portfolio'];
    const parentWords = ['parenting','mom','dad','kids','family','school','homework'];
    const genZCount = genZWords.filter(w => allCaptions.includes(w)).length;
    const proCount = professionalWords.filter(w => allCaptions.includes(w)).length;
    const parentCount = parentWords.filter(w => allCaptions.includes(w)).length;
    // Weighted blend favoring 18-45 bracket
    const ageScore = genZCount > 5 ? 0.9 : genZCount > 2 ? 0.85 : proCount > 3 ? 0.80 : parentCount > 2 ? 0.7 : 0.75;
    const ageEstimate = Math.round(ageScore * 85); // as % of 18-45

    // Sub-score 3: Gender distribution (weight 0.15)
    const fashionWords = ['ootd','outfit','fashion','style','makeup','skincare','beauty','dress','kurta'];
    const techWords = ['gaming','tech','phone','laptop','gadget','iphone','android','fps','processor'];
    const fashionCount = fashionWords.filter(w => allCaptions.includes(w) || hashtagText.includes(w)).length;
    const techCount = techWords.filter(w => allCaptions.includes(w) || hashtagText.includes(w)).length;
    let malePct, femalePct;
    if (techCount > fashionCount * 2) { malePct = 68; femalePct = 32; }
    else if (fashionCount > techCount * 2) { malePct = 32; femalePct = 68; }
    else { malePct = 52; femalePct = 48; }
    // Lenskart is unisex — balanced is best
    const genderBalance = 1 - Math.abs(malePct - femalePct) / 100;
    const genderScore = genderBalance > 0.85 ? 1.0 : genderBalance > 0.7 ? 0.8 : genderBalance > 0.5 ? 0.6 : 0.5;

    // Sub-score 4: Interest alignment with eyewear (weight 0.20)
    const eyewearAdjacent = ['fashion','style','tech','gaming','office','professional','travel','lifestyle','fitness','wellness','screen','computer'];
    const alignedCount = eyewearAdjacent.filter(w => allCaptions.includes(w) || hashtagText.includes(w)).length;
    const interestScore = alignedCount > 6 ? 1.0 : alignedCount > 4 ? 0.8 : alignedCount > 2 ? 0.6 : 0.4;

    // Sub-score 5: Audience authenticity (weight 0.10)
    // Bot detection: engagement-to-follower ratio check
    const followers_n = profileData.followers || 1;
    const engRate = mediaData.engagementRate || 0;
    let authenticityScore;
    if (engRate > 1 && engRate < 20) authenticityScore = 0.90; // healthy range
    else if (engRate > 20) authenticityScore = 0.60; // suspiciously high — possible bots
    else if (engRate < 0.3) authenticityScore = 0.50; // suspiciously low — possible bought followers
    else authenticityScore = 0.75;
    // Check for generic comment patterns in AI analysis
    if (aiAnalysis.genericCommentRatio > 0.5) authenticityScore *= 0.7;

    const overall = geoScore*0.30 + ageScore*0.25 + genderScore*0.15 + interestScore*0.20 + authenticityScore*0.10;

    return {
      overall: parseFloat(overall.toFixed(3)),
      grade: this._grade(overall),
      label: this._label(overall),
      breakdown: {
        geoMatch: { score: geoScore, value: `~${geoPercent}% India`, detail: 'Estimated from hashtags & brand signals', weight: 0.30 },
        ageMatch: { score: ageScore, value: `~${ageEstimate}% aged 18-45`, detail: 'Primary purchase-ready age group', weight: 0.25 },
        genderSplit: { score: genderScore, value: `${malePct}M / ${femalePct}F`, detail: 'Lenskart is unisex — balance is ideal', weight: 0.15 },
        interestAlign: { score: interestScore, value: `${alignedCount}/12 signals`, detail: 'Topics adjacent to eyewear need', weight: 0.20 },
        authenticity: { score: authenticityScore, value: `${Math.round(authenticityScore*100)}%`, detail: 'Engagement health check', weight: 0.10 },
      },
      insights: this._insights(geoPercent, ageEstimate, interestScore, authenticityScore, malePct, techCount),
    };
  }

  _insights(geo, age, interest, auth, malePct, techCount) {
    const out = [];
    if (geo > 75) out.push(`~${geo}% Indian audience — strong geographic match for Lenskart`);
    else out.push(`Only ~${geo}% estimated Indian audience — geographic risk for conversion`);
    if (interest > 0.7) out.push('Content touches multiple eyewear-adjacent themes — natural fit');
    if (techCount > 3) out.push('Tech/gaming audience present — blue-light glasses opportunity');
    if (auth < 0.7) out.push('Engagement health score low — request audience insights screenshot before signing');
    return out.slice(0, 3);
  }

  _grade(s) {
    if (s > 0.85) return 'A+'; if (s > 0.75) return 'A'; if (s > 0.65) return 'B+';
    if (s > 0.55) return 'B'; if (s > 0.45) return 'C+'; if (s > 0.35) return 'C'; return 'D';
  }

  _label(s) {
    if (s > 0.80) return 'Strong audience-market alignment';
    if (s > 0.65) return 'Good audience match';
    if (s > 0.50) return 'Moderate audience alignment';
    return 'Weak audience match';
  }
}

module.exports = AudienceScorer;
