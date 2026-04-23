const COMPETITOR_EYEWEAR = ['titan eye','titan eyeplus','john jacobs','coolwinks','lenskart competitor','specsmakers','vision express','ray-ban','rayban','oakley','vogue eyewear','fastrack eyewear','vincent chase'];

class AffinityScorer {
  score(profileData, mediaData, brandCollabs = [], campaignConfig = {}) {
    const posts = mediaData.posts || [];
    const allCaptions = posts.map(p => (p.caption || '').toLowerCase()).join(' ');
    const hashtags = (mediaData.hashtags || []).map(h => (h.tag || '').toLowerCase()).join(' ');

    // Sub-score 1: Content-product natural fit (weight 0.30)
    const fitKeywords = {
      fashion: ['fashion','style','ootd','outfit','look','accessory','accessories','wear','dress','trendy'],
      tech: ['tech','gadget','gaming','setup','screen','laptop','computer','code','developer'],
      travel: ['travel','trip','explore','wanderlust','adventure','vacation','destination'],
      comedy: ['comedy','funny','meme','jokes','skit','parody','relatable'],
      lifestyle: ['lifestyle','vlog','day in','routine','morning','wellness','self care'],
      fitness: ['gym','fitness','workout','health','training'],
    };
    const scores = {};
    for (const [cat, words] of Object.entries(fitKeywords)) {
      scores[cat] = words.filter(w => allCaptions.includes(w) || hashtags.includes(w)).length;
    }
    // Map content categories to eyewear fit
    const fitMap = { fashion: 0.95, tech: 0.80, travel: 0.85, comedy: 0.75, lifestyle: 0.80, fitness: 0.55 };
    const topCat = Object.entries(scores).sort((a,b) => b[1]-a[1])[0];
    const contentFitScore = topCat && topCat[1] > 0 ? (fitMap[topCat[0]] || 0.60) : 0.60;
    const contentCategory = topCat ? topCat[0] : 'general';

    // Sub-score 2: Past category experience (weight 0.25)
    const brands = brandCollabs || [];
    const hasEyewear = brands.some(b => b.industry === 'Eyewear');
    const hasFashion = brands.some(b => b.industry === 'Fashion' || b.industry === 'Beauty');
    const hasTech = brands.some(b => b.industry === 'Tech');
    const hasLifestyle = brands.some(b => b.industry === 'Food' || b.industry === 'Entertainment');
    const categoryExpScore = hasEyewear ? 1.0 : hasFashion ? 0.80 : hasTech ? 0.65 : hasLifestyle ? 0.50 : 0.35;
    const categoryExpDetail = hasEyewear ? 'Prior eyewear experience' : hasFashion ? 'Adjacent fashion/beauty' : hasTech ? 'Tech adjacent' : 'No adjacent category';

    // Sub-score 3: Audience receptivity to brand content (weight 0.25)
    // Compare brand post engagement vs organic — use brand collab data
    let receptivityScore = 0.65; // default
    if (brands.length > 0) {
      const brandEngRates = brands.map(b => b.engagementRate || 0).filter(r => r > 0);
      const avgBrandEng = brandEngRates.length ? brandEngRates.reduce((a,b)=>a+b,0)/brandEngRates.length : 0;
      const organicEng = mediaData.engagementRate || 2;
      const ratio = organicEng > 0 ? avgBrandEng / organicEng : 0.6;
      receptivityScore = ratio > 0.85 ? 1.0 : ratio > 0.70 ? 0.8 : ratio > 0.50 ? 0.5 : 0.2;
    }

    // Sub-score 4: Competitor conflict (weight 0.20)
    const competitorFound = COMPETITOR_EYEWEAR.filter(c => allCaptions.includes(c));
    // Lenskart itself — if they already work with lenskart
    const lenskartCollab = allCaptions.includes('lenskart');
    let competitorScore, competitorDetail, dealBreakers = [];
    if (competitorFound.length > 0) {
      competitorScore = 0.1;
      competitorDetail = `Active competitor collab: ${competitorFound[0]}`;
      dealBreakers.push(`Recent collaboration with competing brand: ${competitorFound[0]}`);
    } else if (lenskartCollab) {
      competitorScore = 1.0;
      competitorDetail = 'Existing Lenskart collaborator — proven fit';
    } else {
      competitorScore = 1.0;
      competitorDetail = 'No competing eyewear brands detected';
    }

    const overall = contentFitScore*0.30 + categoryExpScore*0.25 + receptivityScore*0.25 + competitorScore*0.20;

    return {
      overall: parseFloat(overall.toFixed(3)),
      grade: this._grade(overall),
      label: this._label(overall),
      breakdown: {
        contentFit: { score: contentFitScore, value: contentCategory.charAt(0).toUpperCase()+contentCategory.slice(1), detail: `${contentCategory} content — eyewear fit: ${Math.round(contentFitScore*100)}%`, weight: 0.30 },
        categoryExp: { score: categoryExpScore, value: categoryExpDetail, detail: 'Past brand collaboration category analysis', weight: 0.25 },
        audienceReceptivity: { score: receptivityScore, value: `${Math.round(receptivityScore*100)}%`, detail: 'Brand vs organic engagement ratio', weight: 0.25 },
        competitorConflict: { score: competitorScore, value: competitorFound.length > 0 ? 'CONFLICT' : lenskartCollab ? 'Existing Partner' : 'Clear', detail: competitorDetail, weight: 0.20 },
      },
      dealBreakers,
      insights: this._insights(contentCategory, contentFitScore, categoryExpDetail, competitorFound, lenskartCollab),
    };
  }

  _insights(cat, fit, catExp, competitors, isLenskart) {
    const out = [];
    out.push(`${cat.charAt(0).toUpperCase()+cat.slice(1)} content creator — eyewear integration feels ${fit > 0.8 ? 'natural' : fit > 0.6 ? 'achievable' : 'forced'}`);
    if (isLenskart) out.push('Existing Lenskart partner — lower activation cost and proven content performance');
    else if (competitors.length) out.push(`⚠️ Competitor conflict detected: ${competitors[0]} — include exclusivity clause or reconsider`);
    else out.push('No competitor eyewear conflicts — clean slate for Lenskart branding');
    if (catExp.includes('Prior')) out.push('Prior eyewear experience reduces creative ramp-up time');
    return out.slice(0,3);
  }

  _grade(s) {
    if (s > 0.85) return 'A+'; if (s > 0.75) return 'A'; if (s > 0.65) return 'B+';
    if (s > 0.55) return 'B'; if (s > 0.45) return 'C+'; if (s > 0.35) return 'C'; return 'D';
  }

  _label(s) {
    if (s > 0.80) return 'Excellent brand-influencer affinity'; if (s > 0.65) return 'Strong affinity';
    if (s > 0.50) return 'Moderate affinity'; return 'Low affinity — high friction expected';
  }
}

module.exports = AffinityScorer;
