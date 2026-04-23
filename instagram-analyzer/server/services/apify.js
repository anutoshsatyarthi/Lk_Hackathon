const { ApifyClient } = require('apify-client');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class ApifyService {
  constructor(config) {
    this.enabled = !!config.apify?.apiToken;
    if (this.enabled) {
      this.client = new ApifyClient({ token: config.apify.apiToken });
    }
    this._postCache = {}; // username → { items, fetchedAt }
  }

  // Shared post fetch — results cached in-memory for 1 hour to avoid duplicate Apify runs
  async fetchPostItems(username, limit = 50) {
    if (!this.enabled) throw new Error('Apify not configured');
    const key = username.toLowerCase();
    const cached = this._postCache[key];
    if (cached && Date.now() - cached.fetchedAt < 3_600_000) {
      console.log(`[Apify] Reusing cached post items for @${username} (${cached.items.length} items)`);
      return cached.items;
    }
    const items = await this._run('apify~instagram-post-scraper', { username: [username], resultsLimit: limit }, 300);
    this._postCache[key] = { items, fetchedAt: Date.now() };
    return items;
  }

  async _run(actorId, input, waitSecs = 120) {
    if (!this.enabled) throw new Error('Apify not configured');
    console.log(`[Apify] Running ${actorId} for input: ${JSON.stringify(input).slice(0, 80)}`);
    const run = await this.client.actor(actorId).call(input, { waitSecs });
    const { items } = await this.client.dataset(run.defaultDatasetId).listItems();
    console.log(`[Apify] ${actorId} returned ${items.length} items`);
    return items;
  }

  // ── POSTS WITH VIDEO VIEWS ────────────────────────────────────────────────
  // Returns posts with videoViewCount populated (unavailable via Meta API for discovered accounts)
  async getPostsWithViews(username, limit = 50) {
    const items = await this._run('apify/instagram-scraper', {
      directUrls: [`https://www.instagram.com/${username}/`],
      resultsType: 'posts',
      resultsLimit: limit,
      addParentData: false,
    }, 300);

    // Normalize to a map keyed by shortCode for easy lookup
    const viewMap = {};
    for (const item of items) {
      if (item.shortCode) {
        viewMap[item.shortCode] = {
          videoViewCount: item.videoViewCount || 0,
          videoPlayCount: item.videoPlayCount || 0,
          likesCount: item.likesCount || 0,
          commentsCount: item.commentsCount || 0,
          type: item.type,
        };
      }
    }
    return viewMap;
  }

  // ── VVIP NETWORK VIA POST MENTIONS ────────────────────────────────────────
  // Derives notable connections by extracting @mentions from posts, then
  // batch-fetching profiles for the top mentioned accounts.
  async _getVVIPsFromMentions(username, postsLimit = 50) {
    // Step 1: fetch posts to extract mentions
    const postItems = await this._run('apify~instagram-post-scraper', {
      username: [username],
      resultsLimit: postsLimit,
    }, 300);

    // Step 2: rank mentions by frequency
    const mentionFreq = {};
    for (const item of postItems) {
      for (const m of (item.mentions || [])) {
        const u = m.replace('@', '').toLowerCase();
        if (u !== username.toLowerCase()) {
          mentionFreq[u] = (mentionFreq[u] || 0) + 1;
        }
      }
    }

    // Valid IG username: 1-30 chars, alphanumeric/dot/underscore, no trailing dot
    const validUsername = (u) => /^[A-Za-z0-9._]{1,30}$/.test(u) && !u.endsWith('.');

    const topMentioned = Object.entries(mentionFreq)
      .sort((a, b) => b[1] - a[1])
      .map(([u]) => u)
      .filter(validUsername)
      .slice(0, 20);

    if (topMentioned.length === 0) {
      console.log(`[Apify] No mentions found in posts for @${username}`);
      return [];
    }

    console.log(`[Apify] Top mentions for @${username}: ${topMentioned.slice(0, 8).join(', ')}`);

    // Step 3: batch-fetch profiles for top mentioned users
    const profileUrls = topMentioned.map((u) => `https://www.instagram.com/${u}/`);
    const profileItems = await this._run('apify~instagram-scraper', {
      directUrls: profileUrls,
      resultsType: 'details',
      resultsLimit: topMentioned.length,
    }, 120);

    // Normalise to the shape _filterNotable expects
    const normalised = profileItems.map((p) => ({
      username: p.username,
      fullName: p.fullName || p.username,
      followersCount: p.followersCount || 0,
      isVerified: p.verified || false,
      profilePicUrl: p.profilePicUrl || null,
      biography: p.biography || '',
    }));

    return this._filterNotable(normalised);
  }

  // ── NOTABLE FOLLOWING (mentions-based) ───────────────────────────────────
  async getNotableFollowing(username) {
    return this._getVVIPsFromMentions(username);
  }

  // ── NOTABLE FOLLOWERS ─────────────────────────────────────────────────────
  // Real follower lists aren't publicly scrapable; return empty.
  async getNotableFollowers(username) {
    console.log(`[Apify] Follower scraping not available — returning empty for @${username}`);
    return [];
  }

  // Filter and rank accounts by notability (verified or >50k followers)
  _filterNotable(items) {
    return items
      .filter((u) => u.isVerified || (u.followersCount || 0) >= 10000)
      .sort((a, b) => (b.followersCount || 0) - (a.followersCount || 0))
      .slice(0, 30)
      .map((u) => ({
        username: u.username,
        displayName: u.fullName || u.username,
        followers: u.followersCount || 0,
        isVerified: u.isVerified || false,
        avatarUrl: u.profilePicUrl || null,
        category: this._inferCategory(u.fullName || u.username, u.biography || ''),
      }));
  }

  // Simple rule-based category inference from name/bio
  _inferCategory(name, bio) {
    const text = `${name} ${bio}`.toLowerCase();
    if (/actor|actress|film|bollywood|movie|cinema/.test(text)) return 'Bollywood';
    if (/singer|music|artist|rapper|band/.test(text)) return 'Music';
    if (/cricket|football|sport|athlete|player|ipl/.test(text)) return 'Athlete';
    if (/fashion|designer|style|couture/.test(text)) return 'Fashion Designer';
    if (/comedian|comedy|funny|humour/.test(text)) return 'Comedian';
    if (/journalist|news|reporter|editor/.test(text)) return 'Journalist';
    if (/politician|minister|mp|mla|politics/.test(text)) return 'Politician';
    if (/founder|ceo|entrepreneur|startup/.test(text)) return 'Business Leader';
    if (/creator|youtuber|influencer|blogger/.test(text)) return 'Creator';
    return 'Public Figure';
  }
}

module.exports = ApifyService;
