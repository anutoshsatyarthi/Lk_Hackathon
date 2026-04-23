const { ApifyClient } = require('apify-client');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class ApifyService {
  constructor(config) {
    this.enabled = !!config.apify?.apiToken;
    if (this.enabled) {
      this.client = new ApifyClient({ token: config.apify.apiToken });
    }
  }

  async _run(actorId, input, timeoutSecs = 120) {
    if (!this.enabled) throw new Error('Apify not configured');
    console.log(`[Apify] Running ${actorId} for input: ${JSON.stringify(input).slice(0, 80)}`);
    const run = await this.client.actor(actorId).call(input, { timeoutSecs });
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
    }, 180);

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

  // ── FOLLOWERS LIST ────────────────────────────────────────────────────────
  // Returns top notable accounts from followers (filtered by follower count or verified)
  async getNotableFollowers(username, maxItems = 500) {
    const items = await this._run('apify/instagram-followers-scraper', {
      username,
      maxItems,
    }, 300);

    return this._filterNotable(items);
  }

  // ── FOLLOWING LIST ────────────────────────────────────────────────────────
  // Returns top notable accounts this user follows
  async getNotableFollowing(username, maxItems = 500) {
    const items = await this._run('apify/instagram-following-scraper', {
      username,
      maxItems,
    }, 300);

    return this._filterNotable(items);
  }

  // Filter and rank accounts by notability (verified or >50k followers)
  _filterNotable(items) {
    return items
      .filter((u) => u.isVerified || (u.followersCount || 0) >= 50000)
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
