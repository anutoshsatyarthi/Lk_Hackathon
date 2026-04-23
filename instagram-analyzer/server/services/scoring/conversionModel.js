class ConversionModel {
  predict(reachEstimate, scores, campaignConfig) {
    const fee = campaignConfig.fee || 100000;
    const numPosts = campaignConfig.numPosts || 1;
    const fmt = (campaignConfig.contentFormat || 'reel').toLowerCase();
    const productCategory = campaignConfig.productCategory || 'eyewear';
    const aov = campaignConfig.aov || 3500;
    const profitMargin = campaignConfig.profitMargin || 0.40;
    const hasDiscount = campaignConfig.hasDiscountCode || false;
    const discountPct = campaignConfig.discountPercent || 0;
    const hasVTO = campaignConfig.hasVirtualTryOn || false;
    const integrationLevel = campaignConfig.integrationLevel || 'moderate';

    const engS = scores.engScore?.overall || 0.5;
    const affS = scores.affnScore?.overall || 0.5;
    const ctaS = scores.contScore?.breakdown?.captionCTA?.score || 0.5;
    const affcS = scores.affcScore?.overall || 0.6;

    // Stage 1: CTR
    const baseCTR = { reel: 0.030, carousel: 0.022, image: 0.012, story: 0.020, mix: 0.025 };
    const rawCTR = baseCTR[fmt] || 0.025;
    const ctrMultiplier = engS * 0.4 + affS * 0.3 + ctaS * 0.3;
    const adjustedCTR = rawCTR * (0.6 + ctrMultiplier * 0.8);

    // Stage 2: Landing rate
    const baseLandingRate = 0.75;
    const landingBoosts = (hasDiscount ? 0.08 : 0) + (hasVTO ? 0.10 : 0);
    const landingRate = Math.min(0.92, baseLandingRate + landingBoosts);

    // Stage 3: Cart rate
    const cartRateMap = { eyewear: 0.12, sunglasses: 0.08, contacts: 0.06, bluelight: 0.15 };
    const baseCartRate = cartRateMap[productCategory] || 0.10;
    const cartBoosts = (hasDiscount ? 0.30 : 0) + (hasVTO ? 0.20 : 0);
    const affluenceBoost = (affcS - 0.5) * 0.15;
    const cartRate = Math.min(0.40, baseCartRate * (1 + cartBoosts) * (1 + affluenceBoost));

    // Stage 4: Purchase rate
    const basePurchaseRate = 0.30;
    const purchaseBoosts = (hasDiscount ? 0.25 : 0) + (integrationLevel === 'deep' ? 0.10 : 0);
    const purchaseRate = Math.min(0.65, basePurchaseRate * (1 + purchaseBoosts));

    // Calculate for 3 scenarios
    const scenarios = {
      pessimistic: { ctrMult: 0.55, cartMult: 0.65, purchaseMult: 0.70 },
      expected:    { ctrMult: 1.00, cartMult: 1.00, purchaseMult: 1.00 },
      optimistic:  { ctrMult: 1.55, cartMult: 1.40, purchaseMult: 1.30 },
    };

    const reach = reachEstimate.confidenceInterval;
    const reachMap = { pessimistic: reach.low, expected: reach.expected, optimistic: reach.high };

    const funnel = { impressions: {}, clicks: {}, visits: {}, carts: {}, purchases: {} };
    const revenue = {}, profit = {}, roi = {}, roas = {}, cac = {};
    const productionCost = fee * 0.10; // estimate 10% of fee for production
    const totalCost = fee + productionCost;
    const effectiveAOV = hasDiscount ? aov * (1 - discountPct/100) : aov;

    for (const [sc, mult] of Object.entries(scenarios)) {
      const imp = reachMap[sc];
      const clicks = Math.round(imp * adjustedCTR * mult.ctrMult);
      const visits = Math.round(clicks * landingRate);
      const carts_n = Math.round(visits * cartRate * mult.cartMult);
      const purchases_n = Math.round(carts_n * purchaseRate * mult.purchaseMult);
      const rev = Math.round(purchases_n * effectiveAOV);
      const grossProfit = Math.round(rev * profitMargin);
      const netProfit = grossProfit - totalCost;
      funnel.impressions[sc] = imp;
      funnel.clicks[sc] = clicks;
      funnel.visits[sc] = visits;
      funnel.carts[sc] = carts_n;
      funnel.purchases[sc] = purchases_n;
      revenue[sc] = rev;
      profit[sc] = netProfit;
      roi[sc] = totalCost > 0 ? parseFloat(((netProfit / totalCost) * 100).toFixed(1)) : 0;
      roas[sc] = totalCost > 0 ? parseFloat((rev / totalCost).toFixed(2)) : 0;
      cac[sc] = purchases_n > 0 ? Math.round(totalCost / purchases_n) : 99999;
    }

    const breakEvenPurchases = Math.ceil(totalCost / (effectiveAOV * profitMargin));
    const dailyPurchaseRate = funnel.purchases.expected / Math.max(1, campaignConfig.durationDays || 14);

    return {
      funnel,
      revenue, profit, roi, roas, cac,
      cpm: reachEstimate.uniqueReach > 0 ? parseFloat(((totalCost / reachEstimate.uniqueReach) * 1000).toFixed(0)) : 0,
      breakEvenPurchases,
      daysToBreakEven: dailyPurchaseRate > 0 ? Math.ceil(breakEvenPurchases / dailyPurchaseRate) : 999,
      conversionRates: {
        ctr: parseFloat((adjustedCTR * 100).toFixed(2)),
        landingRate: parseFloat((landingRate * 100).toFixed(1)),
        cartRate: parseFloat((cartRate * 100).toFixed(1)),
        purchaseRate: parseFloat((purchaseRate * 100).toFixed(1)),
        endToEnd: reachEstimate.uniqueReach > 0 ? parseFloat(((funnel.purchases.expected / reachEstimate.uniqueReach) * 100).toFixed(3)) : 0,
      },
      totalCost,
    };
  }
}

module.exports = ConversionModel;
