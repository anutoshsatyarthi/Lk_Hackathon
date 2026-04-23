const axios = require('axios');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class InstagramService {
  constructor(config) {
    this.accessToken = config.meta.accessToken;
    this.baseUrl = config.meta.baseUrl;
    this.version = config.meta.apiVersion;
    this.igAccountId = config.meta.igAccountId;
    this.appId = config.meta.appId;
    this.appSecret = config.meta.appSecret;
  }

  _url(endpoint) {
    return `${this.baseUrl}/${this.version}/${endpoint}`;
  }

  async _get(endpoint, params = {}) {
    const url = this._url(endpoint);
    const start = Date.now();
    try {
      const response = await axios.get(url, {
        params: { ...params, access_token: this.accessToken },
        timeout: 15000,
      });
      console.log(`[IG] GET /${endpoint} → ${response.status} (${Date.now() - start}ms)`);
      return response.data;
    } catch (err) {
      const graphErr = err.response?.data?.error;
      if (graphErr) {
        const { message, code, type, fbtrace_id } = graphErr;
        console.error(`[IG] Graph API Error ${code} (${type}): ${message} [trace: ${fbtrace_id}]`);

        if (code === 190) {
          console.error('[IG] ⚠ Token expired! Generate a new token at https://developers.facebook.com/tools/explorer/');
        }
        if (code === 10) {
          console.error(`[IG] ⚠ Missing permission for: ${endpoint}. Check your app's permissions.`);
        }
        if (code === 4 || code === 17 || code === 32) {
          console.error('[IG] ⚠ Rate limit hit! Implementing backoff...');
          await this._exponentialBackoff(err, endpoint, params);
        }

        const e = new Error(message);
        e.graphCode = code;
        throw e;
      }
      throw err;
    }
  }

  async _exponentialBackoff(originalErr, endpoint, params, retries = 3) {
    for (let i = 0; i < retries; i++) {
      const delay = Math.pow(2, i) * 1000 + Math.random() * 500;
      console.log(`[IG] Backoff retry ${i + 1}/${retries} in ${Math.round(delay)}ms`);
      await sleep(delay);
      try {
        return await this._get(endpoint, params);
      } catch (retryErr) {
        if (i === retries - 1) throw retryErr;
      }
    }
  }

  // ── TOKEN MANAGEMENT ──────────────────────────────────────────────────────

  async exchangeForLongLivedToken(shortLivedToken) {
    const response = await axios.get(this._url('oauth/access_token'), {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: this.appId,
        client_secret: this.appSecret,
        fb_exchange_token: shortLivedToken,
      },
    });
    return response.data; // { access_token, token_type, expires_in }
  }

  async refreshLongLivedToken() {
    const response = await axios.get(this._url('oauth/access_token'), {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: this.appId,
        client_secret: this.appSecret,
        fb_exchange_token: this.accessToken,
      },
    });
    return response.data;
  }

  async checkTokenValidity() {
    try {
      const data = await this._get('me', { fields: 'id,name' });
      return { valid: true, id: data.id, name: data.name };
    } catch (err) {
      return { valid: false, error: err.message };
    }
  }

  // ── PROFILE DATA ──────────────────────────────────────────────────────────

  async getProfile(igAccountId) {
    const id = igAccountId || this.igAccountId;
    return this._get(id, {
      fields: 'name,username,biography,website,followers_count,follows_count,media_count,profile_picture_url,ig_id',
    });
  }

  // ── MEDIA / POSTS ─────────────────────────────────────────────────────────

  async getMedia(igAccountId, limit = 50, after = null) {
    const id = igAccountId || this.igAccountId;
    const params = {
      fields: 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count,media_product_type,children{media_url,media_type}',
      limit,
    };
    if (after) params.after = after;

    const allPosts = [];
    let response = await this._get(`${id}/media`, params);

    allPosts.push(...(response.data || []));

    // Paginate up to 200 posts
    while (allPosts.length < 200 && response.paging?.cursors?.after) {
      await sleep(150);
      params.after = response.paging.cursors.after;
      response = await this._get(`${id}/media`, params);
      if (!response.data?.length) break;
      allPosts.push(...response.data);
    }

    return { data: allPosts, paging: response.paging };
  }

  async getMediaInsights(mediaId, mediaType = 'IMAGE') {
    const baseMetrics = ['engagement', 'impressions', 'reach', 'saved'];
    const videoMetrics = ['video_views', 'plays'];
    const carouselMetrics = ['carousel_album_engagement'];

    let metrics = [...baseMetrics];
    if (['VIDEO', 'REELS'].includes(mediaType)) metrics.push(...videoMetrics);
    if (mediaType === 'CAROUSEL_ALBUM') metrics.push(...carouselMetrics);

    try {
      const data = await this._get(`${mediaId}/insights`, { metric: metrics.join(',') });
      const result = {};
      for (const item of data.data || []) {
        result[item.name] = item.values?.[0]?.value ?? item.value ?? 0;
      }
      return result;
    } catch (err) {
      // Insights may not be available for all posts (e.g., old posts)
      console.warn(`[IG] Could not fetch insights for ${mediaId}: ${err.message}`);
      return {};
    }
  }

  async getAllMediaWithInsights(igAccountId, limit = 100) {
    const { data: posts } = await this.getMedia(igAccountId, limit);
    const enriched = [];

    for (const post of posts) {
      const insights = await this.getMediaInsights(post.id, post.media_type);
      enriched.push({ ...post, insights });
      await sleep(200); // respect rate limits
    }

    return enriched;
  }

  // ── ACCOUNT INSIGHTS ──────────────────────────────────────────────────────

  async getAccountInsights(igAccountId, since, until) {
    const id = igAccountId || this.igAccountId;
    const metrics = [
      'impressions', 'reach', 'follower_count',
      'email_contacts', 'phone_call_clicks',
      'text_message_clicks', 'get_directions_clicks',
      'website_clicks', 'profile_views',
    ];

    return this._get(`${id}/insights`, {
      metric: metrics.join(','),
      period: 'day',
      since: since || Math.floor(Date.now() / 1000) - 30 * 86400,
      until: until || Math.floor(Date.now() / 1000),
    });
  }

  // ── HASHTAG SEARCH ────────────────────────────────────────────────────────

  async searchHashtag(hashtagName, igAccountId) {
    const userId = igAccountId || this.igAccountId;
    const cleanTag = hashtagName.replace('#', '');

    const tagData = await this._get('ig_hashtag_search', { q: cleanTag, user_id: userId });
    if (!tagData.data?.[0]?.id) return null;

    const hashtagId = tagData.data[0].id;
    const media = await this._get(`${hashtagId}/top_media`, {
      user_id: userId,
      fields: 'id,caption,like_count,comments_count,timestamp',
    });

    return { hashtagId, media: media.data || [] };
  }

  // ── BUSINESS DISCOVERY ────────────────────────────────────────────────────

  async discoverBusiness(targetUsername) {
    const fields = `business_discovery.fields(username,name,biography,website,followers_count,follows_count,media_count,profile_picture_url,media.limit(50){id,caption,media_type,like_count,comments_count,timestamp,permalink,media_url,thumbnail_url,media_product_type}).username(${targetUsername})`;

    const data = await this._get(this.igAccountId, { fields });
    const discovery = data.business_discovery;

    if (!discovery) {
      throw new Error(`Could not find public business/creator account for @${targetUsername}. The account must be a Business or Creator account.`);
    }

    return discovery;
  }

  // ── BRANDED CONTENT ───────────────────────────────────────────────────────

  async getBrandedContent(igAccountId) {
    const id = igAccountId || this.igAccountId;
    const data = await this._get(`${id}/media`, {
      fields: 'id,caption,timestamp,like_count,comments_count,branded_content_partner_id,media_product_type',
      limit: 100,
    });

    return (data.data || []).filter((p) => p.branded_content_partner_id);
  }

  // ── PAGE ID → IG ACCOUNT ID RESOLVER ─────────────────────────────────────

  async resolveIGAccountId() {
    const pages = await this._get('me/accounts');
    const results = [];

    for (const page of pages.data || []) {
      try {
        const pageData = await this._get(page.id, { fields: 'instagram_business_account' });
        if (pageData.instagram_business_account?.id) {
          results.push({ pageId: page.id, pageName: page.name, igAccountId: pageData.instagram_business_account.id });
        }
      } catch {
        // skip pages without IG account
      }
    }

    return results;
  }
}

module.exports = InstagramService;
