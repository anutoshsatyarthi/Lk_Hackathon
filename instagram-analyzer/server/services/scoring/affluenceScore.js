const PREMIUM_BRANDS = new Set(['apple','samsung','bmw','mercedes','sony','lg','dyson','armani','gucci','burberry','rolex','tag heuer','rado','bose','bang & olufsen','nespresso','airbnb','business class','five star','marriott','hilton','ritz','taj']);
const MID_BRANDS = new Set(['oneplus','nike','adidas','puma','zara','h&m','ikea','starbucks','decathlon','booking.com','asus','dell','hp','samsung','bosch','philips','myntra','flipkart','amazon','swiggy','zomato']);
const BUDGET_BRANDS = new Set(['meesho','snapdeal','daraz','dmart','big bazaar','lays','maggi','amul','haldirams','boat','realme','redmi','mi','poco','tecno']);

class AffluenceScorer {
  score(profileData, mediaData, aiAnalysis = {}) {
    const posts = mediaData.posts || [];
    const allCaptions = posts.map(p => (p.caption || '').toLowerCase()).join(' ');
    const brands = mediaData.brands || [];

    // Sub-score 1: Audience tier (weight 0.35)
    let premiumCount = 0, midCount = 0, budgetCount = 0;
    for (const b of brands) {
      const n = (b.brand || '').toLowerCase();
      if ([...PREMIUM_BRANDS].some(p => n.includes(p))) premiumCount++;
      else if ([...MID_BRANDS].some(p => n.includes(p))) midCount++;
      else if ([...BUDGET_BRANDS].some(p => n.includes(p))) budgetCount++;
    }
    // Infer from captions too
    const luxuryWords = ['luxury','premium','exclusive','business class','first class','five star','rooftop','vip','suite'];
    const luxuryCount = luxuryWords.filter(w => allCaptions.includes(w)).length;
    let tierLabel, tierScore;
    if (premiumCount >= 2 || luxuryCount >= 3) { tierLabel = 'Premium'; tierScore = 1.0; }
    else if (premiumCount >= 1 || midCount >= 3 || luxuryCount >= 1) { tierLabel = 'Mid-Premium'; tierScore = 0.75; }
    else if (midCount >= 1 || budgetCount === 0) { tierLabel = 'Mid-range'; tierScore = 0.55; }
    else { tierLabel = 'Budget'; tierScore = 0.30; }

    // Sub-score 2: Metro vs non-metro (weight 0.25)
    const metroIndicators = ['mumbai','delhi','bangalore','bengaluru','hyderabad','pune','chennai','kolkata','gurgaon','noida','navi mumbai','thane','bkc','connaught','cp delhi','koramangala','bandra','lower parel','juhu','powai'];
    const tier2Cities = ['jaipur','lucknow','indore','ahmedabad','surat','nagpur','bhopal','patna','kanpur','coimbatore','kochi'];
    const metroCount = metroIndicators.filter(c => allCaptions.includes(c)).length;
    const tier2Count = tier2Cities.filter(c => allCaptions.includes(c)).length;
    const metroScore = metroCount >= 3 ? 1.0 : metroCount >= 2 ? 0.85 : metroCount >= 1 ? 0.70 : tier2Count >= 1 ? 0.55 : 0.65;
    const metroPercent = Math.round(metroScore * 85);

    // Sub-score 3: Purchase behavior signals (weight 0.20)
    const purchaseWords = ['use code','coupon','discount','offer','sale','buy now','shop now','link in bio','ordered','unboxing','haul','review'];
    const purchaseSignals = purchaseWords.filter(w => allCaptions.includes(w)).length;
    const purchaseScore = purchaseSignals >= 5 ? 1.0 : purchaseSignals >= 3 ? 0.75 : purchaseSignals >= 1 ? 0.55 : 0.35;

    // Sub-score 4: Lenskart price accessibility (weight 0.20)
    // Lenskart AOV ~3500 INR — check if audience can afford it
    const priceAccessScore = tierScore > 0.7 ? 1.0 : tierScore > 0.5 ? 0.75 : tierScore > 0.3 ? 0.50 : 0.30;

    const overall = tierScore*0.35 + metroScore*0.25 + purchaseScore*0.20 + priceAccessScore*0.20;

    return {
      overall: parseFloat(overall.toFixed(3)),
      grade: this._grade(overall),
      label: this._label(overall),
      breakdown: {
        audienceTier: { score: tierScore, value: tierLabel, detail: `Based on ${brands.length} detected brand collabs`, weight: 0.35 },
        metroIndex: { score: metroScore, value: `~${metroPercent}% metro`, detail: 'Tier 1/2 city concentration', weight: 0.25 },
        purchaseBehavior: { score: purchaseScore, value: `${purchaseSignals} signals`, detail: 'Discount codes, hauls, product reviews', weight: 0.20 },
        priceAccessibility: { score: priceAccessScore, value: tierScore > 0.6 ? 'Accessible' : 'Stretch', detail: '₹3,500 AOV accessibility estimate', weight: 0.20 },
      },
      insights: this._insights(tierLabel, metroPercent, purchaseScore, brands),
    };
  }

  _insights(tier, metro, purchase, brands) {
    const out = [];
    out.push(`${tier} audience tier — ₹3,500 AOV is ${tier === 'Budget' ? 'a considered purchase' : 'within comfortable range'}`);
    if (metro > 70) out.push(`${metro}% metro concentration aligns with Lenskart's store and delivery coverage`);
    if (purchase > 0.6) out.push('Strong purchase behavior signals — audience has history of acting on recommendations');
    const brandNames = brands.slice(0,3).map(b => b.brand).join(', ');
    if (brandNames) out.push(`Past brand collabs (${brandNames}) indicate mid-to-premium spending capacity`);
    return out.slice(0,3);
  }

  _grade(s) {
    if (s > 0.85) return 'A+'; if (s > 0.75) return 'A'; if (s > 0.65) return 'B+';
    if (s > 0.55) return 'B'; if (s > 0.45) return 'C+'; if (s > 0.35) return 'C'; return 'D';
  }

  _label(s) {
    if (s > 0.80) return 'Strong purchasing power'; if (s > 0.65) return 'Good purchasing power';
    if (s > 0.50) return 'Moderate purchasing power'; return 'Limited purchasing power';
  }
}

module.exports = AffluenceScorer;
