// ── Lenskart Actual Campaign Performance (calibration anchors) ────────────────
// Source: Lenskart influencer performance data
//   Avg influencer CTR        : 0.6%   (link clicks / impressions)
//   Sahiba Bali (top perf.)   : 0.8%   CTR, 1.17x ROAS
//   Avg running ROAS          : 0.9x
//
// Lenskart Online Funnel (CRO data — all devices, open funnel):
//   Traffic → Add to Cart     : ~13.1%
//   Cart → Payment Initiate   : ~31.2%
//   Payment Initiate → Orders : ~46.9%  (DSR confirmed)
//   Overall Conv %            : ~1.92%
// ─────────────────────────────────────────────────────────────────────────────
const LK_AVG_CTR_REEL    = 0.006;   // 0.6% avg influencer CTR
const LK_TOP_CTR_REEL    = 0.008;   // 0.8% — Sahiba Bali benchmark
const LK_AVG_ROAS        = 0.90;    // avg running ROAS
const LK_TOP_ROAS        = 1.17;    // Sahiba Bali ROAS

const LK_CART_RATE       = 0.131;
const LK_INITIATE_RATE   = 0.312;
const LK_CONFIRM_RATE    = 0.469;

class ConversionModel {
  predict(reachEstimate, scores, campaignConfig) {
    const fee              = campaignConfig.fee || 100000;
    const fmt              = (campaignConfig.contentFormat || 'reel').toLowerCase();
    const productCategory  = campaignConfig.productCategory || 'eyewear';
    const aov              = campaignConfig.aov || 3500;
    const profitMargin     = campaignConfig.profitMargin || 0.40;
    const hasDiscount      = campaignConfig.hasDiscountCode || false;
    const discountPct      = campaignConfig.discountPercent || 0;
    const hasVTO           = campaignConfig.hasVirtualTryOn || false;
    const integrationLevel = campaignConfig.integrationLevel || 'moderate';

    const engS  = scores.engScore?.overall  || 0.5;
    const affS  = scores.affnScore?.overall || 0.5;
    const ctaS  = scores.contScore?.breakdown?.captionCTA?.score || 0.5;
    const affcS = scores.affcScore?.overall || 0.6;

    // ── Stage 1: CTR — anchored to Lenskart real campaign data ───────────
    // Base = 0.6% avg; top performer (Sahiba Bali) = 0.8%
    // Influencer quality multiplies within this band
    const baseCTR = {
      reel:     LK_AVG_CTR_REEL,   // 0.6%
      carousel: 0.005,              // 0.5%
      image:    0.003,              // 0.3%
      story:    0.007,              // 0.7% swipe-up
      mix:      0.0055,
    };
    const rawCTR = baseCTR[fmt] || LK_AVG_CTR_REEL;
    // Quality modifier: low-quality keeps ~0.6%, high-quality can reach 0.8%+
    const qualityMod = 0.75 + (engS * 0.15 + affS * 0.10 + ctaS * 0.10) * 1.33;
    const adjustedCTR = rawCTR * qualityMod;

    // ── Stage 2: Landing rate (clicks → site visits) ──────────────────────
    const landingBoosts = (hasDiscount ? 0.08 : 0) + (hasVTO ? 0.06 : 0);
    const landingRate = Math.min(0.92, 0.75 + landingBoosts);

    // ── Stage 3: Add-to-Cart rate — anchored to LK actual (13.1%) ────────
    const categoryIndex = { eyewear: 1.00, bluelight: 1.10, sunglasses: 0.72, contacts: 0.55 };
    const influencerLift = 1.15; // influencer traffic is higher intent than avg
    const cartBoosts = (hasDiscount ? 0.28 : 0) + (hasVTO ? 0.18 : 0);
    const affluenceBoost = (affcS - 0.5) * 0.12;
    const cartRate = Math.min(0.40,
      LK_CART_RATE * (categoryIndex[productCategory] || 1.0) * influencerLift * (1 + cartBoosts) * (1 + affluenceBoost)
    );

    // ── Stage 4: Payment Initiate rate — anchored to LK actual (31.2%) ───
    const paymentBoosts = (hasDiscount ? 0.20 : 0) + (integrationLevel === 'deep' ? 0.08 : 0);
    const paymentInitiateRate = Math.min(0.70, LK_INITIATE_RATE * (1 + paymentBoosts));

    // ── Stage 5: Confirmed Order rate — anchored to LK actual (46.9%) ────
    const confirmBoosts = (hasDiscount ? 0.10 : 0) + (hasVTO ? 0.05 : 0);
    const confirmRate = Math.min(0.75, LK_CONFIRM_RATE * (1 + confirmBoosts));

    // ── Scenario multipliers ──────────────────────────────────────────────
    // Pessimistic: below avg | Expected: Lenskart avg 0.9x | Optimistic: Sahiba Bali 1.17x
    // CTR mult calibrated so: expected → 0.6% avg, optimistic → 0.8% (Sahiba Bali)
    const topCTRMult = LK_TOP_CTR_REEL / LK_AVG_CTR_REEL; // 0.8 / 0.6 = 1.33
    const scenarios = {
      pessimistic: { ctrMult: 0.55, cartMult: 0.75, payMult: 0.85, confMult: 0.90 },
      expected:    { ctrMult: 1.00, cartMult: 1.00, payMult: 1.00, confMult: 1.00 },
      optimistic:  { ctrMult: topCTRMult, cartMult: 1.00, payMult: 1.00, confMult: 1.00 },
    };

    const reach = reachEstimate.confidenceInterval;
    const reachMap = { pessimistic: reach.low, expected: reach.expected, optimistic: reach.high };

    const funnel = { impressions: {}, clicks: {}, visits: {}, carts: {}, paymentInitiates: {}, purchases: {} };
    const revenue = {}, profit = {}, roi = {}, roas = {}, cac = {};

    const productionCost = fee * 0.10;
    const totalCost      = fee + productionCost;
    const effectiveAOV   = hasDiscount ? aov * (1 - discountPct / 100) : aov;

    for (const [sc, mult] of Object.entries(scenarios)) {
      const imp      = reachMap[sc];
      const clicks   = Math.round(imp * adjustedCTR * mult.ctrMult);
      const visits   = Math.round(clicks * landingRate);
      const carts_n  = Math.round(visits * cartRate * mult.cartMult);
      const inits_n  = Math.round(carts_n * paymentInitiateRate * mult.payMult);
      const orders_n = Math.round(inits_n * confirmRate * mult.confMult);
      const rev      = Math.round(orders_n * effectiveAOV);
      const gross    = Math.round(rev * profitMargin);
      const net      = gross - totalCost;

      funnel.impressions[sc]      = imp;
      funnel.clicks[sc]           = clicks;
      funnel.visits[sc]           = visits;
      funnel.carts[sc]            = carts_n;
      funnel.paymentInitiates[sc] = inits_n;
      funnel.purchases[sc]        = orders_n;
      revenue[sc] = rev;
      profit[sc]  = net;
      roi[sc]     = totalCost > 0 ? parseFloat(((net / totalCost) * 100).toFixed(1)) : 0;
      roas[sc]    = totalCost > 0 ? parseFloat((rev / totalCost).toFixed(2)) : 0;
      cac[sc]     = orders_n > 0  ? Math.round(totalCost / orders_n) : 99999;
    }

    const breakEvenPurchases = Math.ceil(totalCost / (effectiveAOV * profitMargin));
    const dailyPurchaseRate  = funnel.purchases.expected / Math.max(1, campaignConfig.durationDays || 14);

    return {
      funnel,
      revenue, profit, roi, roas, cac,
      benchmarks: { avgCTR: LK_AVG_CTR_REEL * 100, topCTR: LK_TOP_CTR_REEL * 100, avgROAS: LK_AVG_ROAS, topROAS: LK_TOP_ROAS },
      cpm: reachEstimate.uniqueReach > 0
        ? parseFloat(((totalCost / reachEstimate.uniqueReach) * 1000).toFixed(0)) : 0,
      breakEvenPurchases,
      daysToBreakEven: dailyPurchaseRate > 0 ? Math.ceil(breakEvenPurchases / dailyPurchaseRate) : 999,
      conversionRates: {
        ctr:                 parseFloat((adjustedCTR * 100).toFixed(2)),
        landingRate:         parseFloat((landingRate * 100).toFixed(1)),
        cartRate:            parseFloat((cartRate * 100).toFixed(1)),
        paymentInitiateRate: parseFloat((paymentInitiateRate * 100).toFixed(1)),
        confirmRate:         parseFloat((confirmRate * 100).toFixed(1)),
        endToEnd:            reachEstimate.uniqueReach > 0
          ? parseFloat(((funnel.purchases.expected / reachEstimate.uniqueReach) * 100).toFixed(3)) : 0,
      },
      totalCost,
    };
  }
}

module.exports = ConversionModel;
