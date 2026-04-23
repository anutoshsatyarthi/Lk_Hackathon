const Anthropic = require('@anthropic-ai/sdk');

class AnthropicService {
  constructor(config) {
    this.client = new Anthropic({ apiKey: config.anthropic.apiKey });
    this.model = 'claude-sonnet-4-6';
  }

  async _chat(systemPrompt, userContent) {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent }],
    });
    return response.content[0].text;
  }

  async _parseJSON(text) {
    // Extract JSON from markdown code blocks if present
    const match = text.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
    const raw = match ? match[1] : text.trim();
    try {
      return JSON.parse(raw);
    } catch {
      // Try to extract array/object if surrounded by extra text
      const arrMatch = raw.match(/\[[\s\S]*\]/);
      const objMatch = raw.match(/\{[\s\S]*\}/);
      if (arrMatch) return JSON.parse(arrMatch[0]);
      if (objMatch) return JSON.parse(objMatch[0]);
      console.error('[Anthropic] Could not parse JSON response:', text.slice(0, 200));
      return [];
    }
  }

  async classifyBrandCollabs(posts) {
    if (!posts?.length) return [];

    const allResults = [];
    const batchSize = 10;

    for (let i = 0; i < posts.length; i += batchSize) {
      const batch = posts.slice(i, i + batchSize);
      const captionsPayload = batch.map((p, idx) => ({
        index: idx,
        id: p.id,
        caption: (p.caption || '').slice(0, 500),
        media_type: p.media_type,
        timestamp: p.timestamp,
      }));

      const systemPrompt = `You are an expert at analyzing Instagram post captions to detect brand collaborations and sponsorships.
Analyze each post and determine:
1. Is this a brand collaboration/sponsored post? (true/false)
2. If yes, which brand name exactly?
3. Brand industry/tier: Beauty, Fashion, Tech, Food, Entertainment, Travel, Fitness, Finance, Home, Other
4. Confidence score (0.0 to 1.0)

Respond ONLY with a valid JSON array. No explanation, no markdown. Example:
[{"index":0,"id":"123","isBrandCollab":true,"brandName":"Nykaa","industry":"Beauty","confidence":0.95}]`;

      try {
        const text = await this._chat(systemPrompt, JSON.stringify(captionsPayload));
        const parsed = await this._parseJSON(text);
        allResults.push(...(Array.isArray(parsed) ? parsed : []));
      } catch (err) {
        console.error('[Anthropic] classifyBrandCollabs batch error:', err.message);
      }
    }

    return allResults.filter((r) => r.isBrandCollab && r.confidence > 0.6);
  }

  async classifyVVIPs(accountList) {
    if (!accountList?.length) return [];

    const systemPrompt = `You are an expert at identifying notable public figures, celebrities, and VVIPs on Instagram, especially in the Indian context.
For each account, determine:
1. Is this a celebrity, politician, VVIP, or notable public figure?
2. Category: Bollywood, Politician, Athlete, Fashion Designer, Comedian, Journalist, Business Leader, Creator, Other
3. Confidence score (0.0 to 1.0)

Respond ONLY with a valid JSON array. No explanation, no markdown. Example:
[{"username":"ranveersingh","isVVIP":true,"displayName":"Ranveer Singh","category":"Bollywood","confidence":0.99}]`;

    try {
      const text = await this._chat(systemPrompt, JSON.stringify(accountList));
      const parsed = await this._parseJSON(text);
      return (Array.isArray(parsed) ? parsed : []).filter((r) => r.isVVIP && r.confidence > 0.7);
    } catch (err) {
      console.error('[Anthropic] classifyVVIPs error:', err.message);
      return [];
    }
  }

  async analyzeEngagementPatterns(posts) {
    if (!posts?.length) return {};

    const summary = posts.slice(0, 30).map((p) => ({
      caption: (p.caption || '').slice(0, 300),
      media_type: p.media_product_type || p.media_type,
      timestamp: p.timestamp,
      likes: p.like_count || 0,
      comments: p.comments_count || 0,
      views: p.insights?.video_views || 0,
    }));

    const systemPrompt = `You are a social media analytics expert specializing in Instagram engagement optimization.
Analyze these posts and identify:
1. Best posting times (day of week + hour ranges)
2. Content themes that drive highest engagement
3. Caption patterns (length, emoji usage, CTA effectiveness)
4. Content type performance (Reels vs Images vs Carousels)
5. Top 3 actionable recommendations

Respond ONLY with valid JSON in this exact shape:
{
  "bestPostingTimes": [{"day":"Monday","hours":"7-9pm","avgEngagement":1234}],
  "topContentThemes": [{"theme":"Comedy skits","avgLikes":5000,"avgComments":200}],
  "captionInsights": {"idealLength":"100-200 chars","emojiImpact":"positive","ctaEffectiveness":"questions increase comments by 40%"},
  "contentTypePerformance": [{"type":"Reels","avgEngagement":8000},{"type":"Image","avgEngagement":3000}],
  "recommendations": ["string1","string2","string3"]
}`;

    try {
      const text = await this._chat(systemPrompt, JSON.stringify(summary));
      return await this._parseJSON(text);
    } catch (err) {
      console.error('[Anthropic] analyzeEngagementPatterns error:', err.message);
      return {};
    }
  }
}

module.exports = AnthropicService;
