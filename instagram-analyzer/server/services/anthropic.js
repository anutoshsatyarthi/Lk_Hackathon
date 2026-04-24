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

  async analyzeCommentSentiment(posts) {
    if (!posts?.length) return null;

    const sample = posts.slice(0, 20).map((p) => ({
      caption: (p.caption || '').slice(0, 400),
      likes: p.like_count || 0,
      comments: p.comments_count || 0,
      topComments: (p.topComments || []).slice(0, 5).map(c => c.text || c),
    }));

    const systemPrompt = `You are a social media sentiment analyst. Based on post captions, engagement ratios, and any available comment text, infer the likely audience sentiment and generate representative example comments.

Analyze the creator's content tone and engagement quality to estimate:
1. Sentiment distribution (must sum to 100%)
2. Top 5 representative comments per sentiment category (write realistic-sounding comments a real fan/viewer would leave — keep them short, authentic, in Hinglish or English)

Respond ONLY with valid JSON in this exact shape:
{
  "sentimentBreakdown": {
    "positive": 72,
    "neutral": 20,
    "negative": 8
  },
  "topComments": {
    "positive": [
      {"text": "Omg this is so good! 😍", "likes": 234},
      {"text": "You're literally the best creator 🔥", "likes": 189},
      {"text": "This made my day yaar!", "likes": 156},
      {"text": "Slaying as always 💫", "likes": 143},
      {"text": "Loved this so much, more please!", "likes": 98}
    ],
    "neutral": [
      {"text": "Where did you get that from?", "likes": 45},
      {"text": "Which filter is this?", "likes": 38},
      {"text": "What's the song name?", "likes": 29},
      {"text": "Location?", "likes": 21},
      {"text": "New here, followed! 👋", "likes": 18}
    ],
    "negative": [
      {"text": "Too much ads lately 😒", "likes": 12},
      {"text": "Felt forced this time", "likes": 8},
      {"text": "Miss your old content", "likes": 15},
      {"text": "Overdone concept", "likes": 6},
      {"text": "Not your best 🤷", "likes": 5}
    ]
  },
  "summary": "One sentence describing the overall audience sentiment tone"
}`;

    try {
      const text = await this._chat(systemPrompt, JSON.stringify(sample));
      return await this._parseJSON(text);
    } catch (err) {
      console.error('[Anthropic] analyzeCommentSentiment error:', err.message);
      return null;
    }
  }
}

module.exports = AnthropicService;
