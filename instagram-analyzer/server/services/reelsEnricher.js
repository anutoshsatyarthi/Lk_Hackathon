const axios = require('axios');
const { ApifyClient } = require('apify-client');
const Anthropic = require('@anthropic-ai/sdk');

class ReelsEnricher {
  constructor(config, apifyService = null) {
    this.apifyToken = config.apify?.apiToken || null;
    this.rapidApiKey = config.rapidApi?.key || null;
    this.anthropicKey = config.anthropic?.apiKey || null;
    this.apifyService = apifyService;
  }

  // Try three methods in order; return enriched posts on first success
  async enrichPosts(username, posts) {
    const methods = [
      { name: 'Apify Post Scraper', fn: () => this._methodApify(username, posts.length) },
      { name: 'RapidAPI', fn: () => this._methodRapidApi(username) },
      { name: 'Claude estimation', fn: () => this._methodClaude(posts) },
    ];

    for (const { name, fn } of methods) {
      try {
        const viewMap = await fn();
        const hasData = viewMap && Object.values(viewMap).some((v) => v > 0);
        if (hasData) {
          console.log(`[ReelsEnricher] Success via ${name}`);
          return this._applyViewMap(posts, viewMap);
        }
        console.log(`[ReelsEnricher] ${name} returned no view data, trying next`);
      } catch (err) {
        console.warn(`[ReelsEnricher] ${name} failed: ${err.message}`);
      }
    }

    console.warn('[ReelsEnricher] All methods failed — video views will be 0');
    return posts;
  }

  // ── Method 1: Apify instagram-post-scraper (shared cache via ApifyService) ──
  async _methodApify(username, limit) {
    if (this.apifyService?.enabled) {
      const items = await this.apifyService.fetchPostItems(username, limit);
      console.log(`[ReelsEnricher] Apify returned ${items.length} items for @${username}`);
      const viewMap = {};
      for (const item of items) {
        const code = item.shortCode || item.shortcode;
        if (code) viewMap[code] = item.videoViewCount || item.videoPlayCount || item.playCount || 0;
      }
      return viewMap;
    }

    if (!this.apifyToken) throw new Error('Apify token not configured');
    const client = new ApifyClient({ token: this.apifyToken });
    const run = await client.actor('apify~instagram-post-scraper').call(
      { username: [username], resultsLimit: limit },
      { waitSecs: 300 }
    );
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    console.log(`[ReelsEnricher] Apify returned ${items.length} items for @${username}`);
    const viewMap = {};
    for (const item of items) {
      const code = item.shortCode || item.shortcode;
      if (code) viewMap[code] = item.videoViewCount || item.videoPlayCount || item.playCount || 0;
    }
    return viewMap;
  }

  // ── Method 2: RapidAPI instagram-scraper-api2 ──────────────────────────────
  async _methodRapidApi(username) {
    if (!this.rapidApiKey) throw new Error('RapidAPI key not configured');

    const response = await axios.get(
      'https://instagram-scraper-api2.p.rapidapi.com/v1/posts',
      {
        params: { username_or_id_or_url: username },
        headers: {
          'x-rapidapi-host': 'instagram-scraper-api2.p.rapidapi.com',
          'x-rapidapi-key': this.rapidApiKey,
        },
        timeout: 30000,
      }
    );

    const items = response.data?.data?.items || [];
    console.log(`[ReelsEnricher] RapidAPI returned ${items.length} items for @${username}`);

    const viewMap = {};
    for (const item of items) {
      const code = item.code || item.shortcode || item.short_code;
      if (code) {
        const views = item.play_count || item.video_view_count || item.view_count || 0;
        viewMap[code] = views;
      }
    }
    return viewMap;
  }

  // ── Method 3: Claude view estimation ───────────────────────────────────────
  async _methodClaude(posts) {
    if (!this.anthropicKey) throw new Error('Anthropic key not configured');

    const videoPosts = posts.filter(
      (p) => p.media_type === 'VIDEO' || p.media_type === 'REELS'
    );
    if (videoPosts.length === 0) return {};

    const postData = videoPosts.map((p) => ({
      shortCode:
        p.permalink?.split('/reel/')[1]?.replace('/', '') ||
        p.permalink?.split('/p/')[1]?.replace('/', ''),
      likes: p.insights?.like_count || 0,
      comments: p.insights?.comments_count || 0,
      timestamp: p.timestamp,
    }));

    const client = new Anthropic({ apiKey: this.anthropicKey });
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Estimate Instagram Reel view counts from engagement metrics.
Reels typically reach 10-50x their like count in views; very viral posts can be 100x+.
Higher comment-to-like ratio usually signals broader reach.

Posts: ${JSON.stringify(postData)}

Return ONLY a JSON object mapping shortCode to estimated integer view count.
Example: {"ABC123": 150000, "XYZ456": 85000}`,
        },
      ],
    });

    const text = message.content[0]?.text || '{}';
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return {};

    const estimates = JSON.parse(match[0]);
    console.log(
      `[ReelsEnricher] Claude estimated views for ${Object.keys(estimates).length} posts`
    );
    return estimates;
  }

  // Apply viewMap back onto posts array
  _applyViewMap(posts, viewMap) {
    return posts.map((post) => {
      const shortCode =
        post.permalink?.split('/reel/')[1]?.replace('/', '') ||
        post.permalink?.split('/p/')[1]?.replace('/', '');

      if (!shortCode) return post;

      const views = viewMap[shortCode];
      if (views && views > 0) {
        return {
          ...post,
          insights: { ...post.insights, video_views: views },
        };
      }
      return post;
    });
  }
}

module.exports = ReelsEnricher;
