const { ApifyClient } = require('apify-client');

const INDUSTRY_MAP = {
  Beauty:        ['nykaa', 'lakme', 'mamaearth', 'mcaffeine', 'minimalist', 'pilgrim', 'loreal', "l'oreal", 'maybelline', 'revlon', 'cerave', 'neutrogena', 'garnier', 'beauty', 'skincare', 'makeup', 'cosmetic', 'serum', 'sunscreen'],
  Fashion:       ['myntra', 'ajio', 'zara', 'h&m', 'levi', 'fashion', 'clothing', 'outfit', 'apparel', 'wear'],
  Tech:          ['samsung', 'apple', 'oneplus', 'realme', 'redmi', 'oppo', 'vivo', 'iqoo', 'asus', 'boat', 'noise', 'tech', 'gadget', 'phone', 'laptop', 'earbuds', 'headphone', 'smartwatch'],
  Food:          ['swiggy', 'zomato', 'dominos', 'mcdonalds', 'subway', 'kfc', 'lays', 'pepsi', 'coca-cola', 'starbucks', 'maggi', 'nestle', 'amul', 'food', 'snack', 'drink', 'restaurant'],
  Finance:       ['zerodha', 'groww', 'paytm', 'razorpay', 'cred', 'upstox', 'angel', 'finance', 'invest', 'trading', 'crypto', 'insurance'],
  Entertainment: ['netflix', 'hotstar', 'disney', 'amazon prime', 'spotify', 'youtube', 'jiocinema', 'zee5', 'sonyliv'],
  Fitness:       ['cult.fit', 'decathlon', 'puma', 'nike', 'adidas', 'reebok', 'gym', 'protein', 'supplement', 'fitness', 'workout'],
  Travel:        ['airbnb', 'booking.com', 'makemytrip', 'goibibo', 'cleartrip', 'oyo', 'hotels', 'travel', 'flight', 'holiday'],
  Telecom:       ['jio', 'airtel', 'vi', 'bsnl', 'vodafone', 'telecom', 'network'],
  Auto:          ['hyundai', 'tata', 'maruti', 'honda', 'toyota', 'bmw', 'mercedes', 'yamaha', 'bajaj', 'hero', 'automobile', 'car', 'bike'],
  Eyewear:       ['lenskart', 'rayban', 'ray-ban', 'oakley', 'eyewear', 'spectacles', 'sunglasses', 'glasses'],
  Alcohol:       ["mcdowell's", 'mcdowell', 'royal stag', 'kingfisher', 'heineken', 'budweiser', 'jack daniel', 'whisky', 'whiskey', 'beer', 'rum', 'vodka'],
  Ecommerce:     ['flipkart', 'amazon', 'meesho', 'big billion', 'snapdeal'],
};

function inferIndustry(text) {
  const lower = text.toLowerCase();
  for (const [industry, keywords] of Object.entries(INDUSTRY_MAP)) {
    if (keywords.some((k) => lower.includes(k))) return industry;
  }
  return 'Other';
}

class BrandDetector {
  constructor(config, apifyService = null) {
    this.apifyToken = config.apify?.apiToken || null;
    this.enabled = !!this.apifyToken;
    this.apifyService = apifyService;
  }

  async detectBrandCollabs(username, posts) {
    if (!posts?.length) return [];

    if (!this.enabled) {
      console.warn('[BrandDetector] Apify token not configured — skipping brand detection');
      return [];
    }

    console.log(`[BrandDetector] Fetching posts via Apify for @${username}`);

    let apifyItems = [];
    try {
      if (this.apifyService?.enabled) {
        apifyItems = await this.apifyService.fetchPostItems(username, posts.length);
      } else {
        const client = new ApifyClient({ token: this.apifyToken });
        const run = await client.actor('apify~instagram-post-scraper').call(
          { username: [username], resultsLimit: posts.length },
          { waitSecs: 300 }
        );
        apifyItems = (await client.dataset(run.defaultDatasetId).listItems()).items;
      }
      console.log(`[BrandDetector] Apify returned ${apifyItems.length} items`);
    } catch (err) {
      console.warn(`[BrandDetector] Apify fetch failed: ${err.message}`);
      return [];
    }

    // Build shortCode → Meta post ID map for matching
    const shortCodeToId = {};
    const codeRegex = /\/(reel|p)\/([A-Za-z0-9_-]+)/;
    for (const post of posts) {
      const match = post.permalink?.match(codeRegex);
      if (match) shortCodeToId[match[2]] = post.id;
    }

    const results = [];
    const syntheticPosts = []; // Apify posts not in Meta batch

    const SPONSOR_HASHTAGS = new Set(['ad', 'sponsored', 'paidpartnership', 'collab', 'gifted', 'brandpartner', 'brandambassador', 'pr']);
    const CODE_RE = /use\s+(my\s+)?code\s+[A-Z0-9]{3,}/i;

    for (const item of apifyItems) {
      const code = item.shortCode || item.shortcode;
      const postId = code ? shortCodeToId[code] : null;

      const caption = item.caption || '';
      const hashtags = (item.hashtags || []).map((h) => h.toLowerCase());
      const sponsorTags = item.sponsorTags || [];

      const isPaid      = item.isPaidPartnership === true;
      const hasSponsorTag = sponsorTags.length > 0;
      const hasHashtag  = hashtags.some((h) => SPONSOR_HASHTAGS.has(h));
      const hasCode     = CODE_RE.test(caption);

      if (!isPaid && !hasSponsorTag && !hasHashtag && !hasCode) continue;

      // Brand name: sponsor tags > @mention > caption pattern
      let brandName = null;
      if (hasSponsorTag) {
        brandName = sponsorTags[0].fullName || sponsorTags[0].username;
      } else {
        const mention = caption.match(/@[\w.]+/)?.[0];
        if (mention) {
          brandName = mention.replace('@', '');
        } else {
          const patternMatch = caption.match(
            /(?:ft\.?\s+|by\s+|thanks\s+to\s+|presented\s+by\s+|powered\s+by\s+|partnered\s+with\s+|in\s+association\s+with\s+)([A-Z][\w.'&\s]{2,30}?)(?:\s+[#@\n]|$)/i
          );
          if (patternMatch) brandName = patternMatch[1].trim();
        }
      }

      // Use synthetic ID when no Meta match
      const effectiveId = postId || `apify_${code || item.id}`;
      if (!brandName) brandName = `Post-${effectiveId.slice(-6)}`;

      const context = `${brandName} ${caption}`;
      const confidence = isPaid || hasSponsorTag ? 0.95 : hasHashtag ? 0.85 : 0.7;
      const source = isPaid ? 'instagram-paid-flag' : hasSponsorTag ? 'sponsor-tag' : hasHashtag ? 'hashtag' : 'code';

      results.push({ id: effectiveId, isBrandCollab: true, brandName, industry: inferIndustry(context), confidence, source });

      // Build synthetic Meta-format post for unmatched items so computeBrandEngagement can use engagement data
      if (!postId) {
        syntheticPosts.push({
          id: effectiveId,
          caption,
          timestamp: item.timestamp,
          permalink: item.url || `https://www.instagram.com/p/${code}/`,
          media_type: item.type === 'Video' ? 'VIDEO' : 'IMAGE',
          media_url: item.displayUrl || item.thumbnailUrl || null,
          thumbnail_url: item.thumbnailUrl || null,
          like_count: item.likesCount || 0,
          comments_count: item.commentsCount || 0,
          insights: {
            video_views: item.videoViewCount || item.videoPlayCount || 0,
            saved: 0,
            reach: 0,
          },
        });
      }

      console.log(`  → ${brandName} (${inferIndustry(context)}) [${source}] conf:${confidence} postId:${effectiveId}`);
    }

    console.log(`[BrandDetector] ${results.length} brand collab posts found (${syntheticPosts.length} from Apify only)`);
    return { classifications: results, syntheticPosts };
  }
}

module.exports = BrandDetector;
