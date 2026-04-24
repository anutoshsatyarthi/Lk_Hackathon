# Influencer Analyzer

A full-stack Instagram analytics and ROAS prediction tool — built for Lenskart's influencer marketing team. Paste any public Instagram Business/Creator profile URL and get a live breakdown of content performance, brand collaborations, audience demographics, comment sentiment, VVIP network, and a predictive ROAS model calibrated against Lenskart's real funnel data.

---

## What It Does

1. **Profile & Key Metrics** — Followers, engagement rate, avg likes/comments/views per post, follower ratio
2. **Post Type Breakdown** — Donut chart of Reels vs Images vs Carousels vs Collabs with percentage splits
3. **Engagement Analytics** — Monthly bar charts (Avg Reel Views, Avg Likes, Avg Comments) with Y-axis scale and gridlines
4. **Audience Demographics** — AI-estimated geography, age (18–45), and gender split from post content signals
5. **Comment Sentiment** — Positive / Neutral / Negative breakdown with donut chart and top-5 representative comments per category (guardrailed: no personal, vulgar, religious, or racial content)
6. **Top Posts** — Top 5 posts ranked by weighted engagement score
7. **VVIP Network** — Notable followers and following scraped via Apify
8. **Hashtag Analysis** — Top hashtags by frequency with usage counts
9. **Brand Collaborations** — AI-detected paid partnerships with industry tagging and per-brand engagement metrics
10. **ROAS Predictor** — 7-module scoring system outputting expected, optimistic, and pessimistic ROAS scenarios calibrated to Lenskart benchmarks

---

## Dashboard Tabs

### Overview
- Post Type Breakdown (donut chart)
- Monthly Engagement Trends (bar charts: Reel Views, Likes, Comments)
- Reels vs Images comparison cards

### Engagement
1. KPI cards (Avg Likes, Avg Comments, Avg Reel Views, Avg Monthly Posts)
2. Monthly Engagement Trends (full view)
3. Reels vs Images
4. Audience Demographics (Geography · Age 18–45 · Gender split)
5. Comment Sentiment (donut + expandable top-5 comments per category)
6. Top Posts by Engagement

### Network
- VVIP Followers — notable accounts following the influencer
- VVIP Following — notable accounts the influencer follows

### Content & Tags
- Hashtag frequency table with usage counts

### Brand Collabs
- AI-detected brand deals with industry, estimated period, avg engagement per collab post

---

## ROAS Predictor

Triggered via the **Predict ROAS** button (Lenskart navy). Takes campaign config as input and runs a 7-module scoring pipeline.

### Campaign Config Inputs
| Field | Description |
|---|---|
| Influencer Fee | Total fee charged (₹) |
| Number of Posts | Reels/feed posts in campaign |
| Duration | 1 week / 2 weeks / 1 month |
| Content Format | Reel / Feed / Story |
| Product Category | Eyeglasses / Sunglasses / Contact Lenses / etc. |
| AOV | Average order value (₹) |
| Profit Margin | % margin on product |
| Discount Code | Yes / No + discount % |
| Integration Level | Dedicated / Integrated / Mention |
| Virtual Try-On | Yes / No |

### Scoring Modules
| Module | Weight | What It Measures |
|---|---|---|
| Engagement Score | 25% | Engagement rate, posting consistency, reel view multiplier |
| Affinity Score | 25% | Brand-content alignment, eyewear/fashion signal strength |
| Audience Score | 20% | Geographic reach (India focus), age 18–45 match, gender split |
| Content Score | 15% | Content quality, caption depth, storytelling signals |
| Affluence Score | 15% | Estimated audience spending capacity from lifestyle signals |

### Reach & Conversion Model
- **Reach** = `min(avgReelViews, naturalReach × 2.0)` — caps viral organic reach to prevent inflated campaign estimates
- **naturalReach** = `followers × reachRate` (calibrated by tier)
- **CTR** — Lenskart benchmark: avg 0.6%, top performer 0.8% (Sahiba Bali)
- **Funnel** — Lenskart real data: 13.1% add-to-cart → 31.2% payment initiate → 46.9% payment confirm

### ROAS Benchmarks (Lenskart)
| Scenario | ROAS |
|---|---|
| Average campaign | 0.9× |
| Top performer | 1.17× |

### Report Sections
- **Executive Summary** — ROAS grade (A–F), composite score with tooltip, purchases, revenue
- **Score Deep Dives** — Per-dimension grade + sub-score breakdown, each with plain-English info tooltips
- **Scenario Cards** — Optimistic / Expected / Pessimistic ROAS with full cost breakdown (no abbreviation)
- **Conversion Funnel** — Visualised click → cart → purchase funnel
- **Risk Assessment** — ROAS-based risk flags (not ROI)
- **Recommendations** — Prioritised actionable tips (no Impact labels)

---

## Metrics & Formulas

### Engagement Rate
```
Engagement Rate (%) = ((Total Likes + Total Comments) / Number of Posts) / Followers × 100
```

### Average Per-Post Metrics
```
Avg Likes per Post     = Total Likes          / Total Posts
Avg Comments per Post  = Total Comments       / Total Posts
Avg Views per Post     = Total Video Views    / Total Posts
```

### Post Type Classification
| Type | Detection Rule |
|---|---|
| Reel | `media_product_type = REELS` or `media_type = VIDEO` |
| Carousel | `media_type = CAROUSEL_ALBUM` |
| Collab | Caption contains "collab" or `media_product_type = BRANDED_CONTENT` |
| Image | All remaining |

### Monthly Engagement Trends
Posts grouped by `YYYY-MM`. Per month:
```
Avg Likes     = Sum of likes    / Post count
Avg Comments  = Sum of comments / Post count
Avg Views     = Sum of views    / Post count
```

### Top Posts Score
```
Score = Likes + (Comments × 2)
```
Comments weighted higher — they signal stronger audience intent.

### Y-Axis Scale (niceMax)
Chart Y-axis is rounded to the nearest clean value (1, 2, 5, 10 × 10ⁿ) for readability.

---

## Tech Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Routing | React Router v6 |
| HTTP Client | Axios (2-min timeout for Apify) |

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js 20 |
| Framework | Express 4 |
| Instagram Data | Meta Graph API v21.0 (Business Discovery) |
| AI Analysis | Anthropic Claude Sonnet (`claude-sonnet-4-6`) |
| Web Scraping | Apify (VVIP network + reel view enrichment) |
| Cache / DB | SQLite via better-sqlite3 |
| Rate Limiting | express-rate-limit |
| Security | Helmet, CORS |

---

## Project Structure

```
instagram-analyzer/
├── client/
│   └── src/
│       ├── pages/
│       │   ├── Home.jsx              # Landing page + username search
│       │   └── Dashboard.jsx         # Main tabbed dashboard
│       ├── sections/
│       │   ├── ProfileCard.jsx       # Avatar, bio, follower stats
│       │   ├── KeyMetrics.jsx        # Engagement rate + avg metric cards
│       │   ├── PostTypeBreakdown.jsx # Donut chart: Reels/Images/Carousels
│       │   ├── EngagementAnalytics.jsx # Monthly bar charts with Y-axis
│       │   ├── AudienceBreakdown.jsx  # Demographics + comment sentiment
│       │   ├── TopPosts.jsx          # Top 5 posts grid
│       │   ├── HashtagAnalysis.jsx   # Hashtag frequency table
│       │   ├── BrandCollabs.jsx      # AI-detected brand deal cards
│       │   └── VVIPNetwork.jsx       # Notable followers/following
│       ├── components/
│       │   ├── Layout.jsx            # App shell + header
│       │   ├── SearchBar.jsx         # Username/URL input
│       │   ├── LoadingState.jsx      # Skeleton loaders
│       │   ├── ErrorState.jsx        # Error + retry UI
│       │   ├── ROIButton.jsx         # "Predict ROAS" CTA (Lenskart navy)
│       │   ├── ROICampaignForm.jsx   # Campaign config modal
│       │   └── ROIReport/
│       │       ├── ROIReport.jsx         # Report shell + score meta
│       │       ├── ExecutiveSummary.jsx  # ROAS grade + key metrics
│       │       ├── ScoreCard.jsx         # Per-dimension deep dive + tooltips
│       │       ├── ScenarioCards.jsx     # Optimistic/Expected/Pessimistic
│       │       ├── ConversionFunnel.jsx  # Funnel visualisation
│       │       └── Recommendations.jsx  # Prioritised action items
│       ├── hooks/
│       │   ├── useProfile.js         # Fetches profile data
│       │   ├── useMedia.js           # Fetches posts + analytics
│       │   ├── useAnalysis.js        # Triggers Claude AI analysis
│       │   ├── useNetwork.js         # Fetches VVIP network
│       │   └── useROIPrediction.js   # Runs ROAS prediction
│       ├── api/
│       │   └── client.js             # Axios instance + API functions
│       └── utils/
│           └── format.js             # formatNumber, formatINR, formatINRExact, formatPercent
│
└── server/
    ├── index.js                      # Express bootstrap + startup validation
    ├── config/
    │   └── env.js                    # Env validation + config object
    ├── routes/
    │   ├── profile.js                # GET /api/profile/:username
    │   ├── media.js                  # GET /api/media/:username
    │   ├── analyze.js                # POST /api/analyze
    │   ├── network.js                # GET /api/network/:username
    │   ├── insights.js               # GET /api/insights/:username
    │   ├── roi.js                    # POST /api/roi/predict/:username
    │   └── proxy.js                  # Image proxy (bypass CDN CORS)
    ├── services/
    │   ├── instagram.js              # Meta Graph API client
    │   ├── anthropic.js              # Claude AI wrapper (brands + sentiment)
    │   ├── apify.js                  # Apify scraping client
    │   ├── analytics.js              # Core metrics engine
    │   ├── cache.js                  # SQLite TTL cache
    │   ├── brandDetector.js          # AI brand collab detection
    │   ├── reelsEnricher.js          # View count enrichment chain
    │   ├── roiPredictor.js           # ROAS prediction orchestrator
    │   ├── demoData.js               # Mock data (Kusha Kapila)
    │   └── scoring/
    │       ├── engagementScore.js    # Engagement rate + consistency
    │       ├── audienceScore.js      # Geo/age/gender demographic estimate
    │       ├── affluenceScore.js     # Audience spending capacity
    │       ├── affinityScore.js      # Brand-content alignment
    │       ├── contentScore.js       # Content quality signals
    │       ├── reachEstimator.js     # Sponsored reach with viral cap
    │       └── conversionModel.js   # Funnel + ROAS calculation
    └── middleware/
        ├── rateLimiter.js            # 100 req / 15 min
        └── errorHandler.js          # Global error handler
```

---

## Data Flow

```
User enters @username
        │
        ▼
Dashboard.jsx mounts → 4 parallel fetches fire
        │
        ├─► GET /api/profile/:username
        │       Meta Graph API → profile metrics → cache 60 min
        │       → ProfileCard + KeyMetrics render immediately
        │
        ├─► GET /api/media/:username?limit=50
        │       Meta Graph API → 50 posts
        │       → ReelsEnricher: Apify → RapidAPI → Claude estimation
        │       → Analytics: trends, breakdown, hashtags, top posts
        │       → cache 30 min
        │       → Overview tab renders
        │
        ├─► POST /api/analyze  (fires after media loads)
        │       3 parallel Claude calls:
        │         BrandDetector → brand collab cards
        │         analyzeEngagementPatterns → insights
        │         analyzeCommentSentiment → sentiment + top comments
        │       + AudienceScorer → demographics estimate
        │       → cache 24 h
        │       → Engagement + Brand Collabs tabs render
        │
        └─► GET /api/network/:username
                Apify → VVIP followers + following
                → cache 24 h
                → Network tab renders

Optional: Predict ROAS button
        │
        ▼
ROICampaignForm (campaign config input)
        │
        ▼
POST /api/roi/predict/:username
        7 scoring modules run in sequence:
        EngagementScore → AudienceScore → AffluenceScore
        AffinityScore → ContentScore → ReachEstimator → ConversionModel
        │
        ▼
ROIReport modal: Executive Summary → Score Deep Dives
               → Scenario Cards → Funnel → Risks → Recommendations
```

---

## Caching Strategy

| Data | Cache Key | TTL |
|---|---|---|
| Profile | `profile:{username}` | 60 min |
| Media + analytics | `media:{username}:{limit}` | 30 min |
| AI analysis | `analysis:{username}` | 24 h |
| VVIP network | `network:{username}` | 24 h |
| ROAS prediction | `roi:{username}:{configHash}` | 24 h |

Cache is stored in SQLite (`server/db/cache.sqlite`). Clear with:
```bash
sqlite3 server/server/db/cache.sqlite "DELETE FROM cache;"
```

---

## Setup

### Prerequisites
- Node.js 18+
- Meta Developer App with `instagram_basic`, `instagram_manage_insights`, `pages_show_list`, `pages_read_engagement` permissions
- Facebook Page linked to an Instagram Business/Creator account
- Anthropic API key
- Apify API token (optional — enables VVIP network tab)

### Environment Variables

```env
# Required
META_APP_ID=
META_APP_SECRET=
META_ACCESS_TOKEN=
INSTAGRAM_BUSINESS_ACCOUNT_ID=
ANTHROPIC_API_KEY=

# Optional
APIFY_API_TOKEN=
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
CACHE_TTL_MINUTES=60
DB_PATH=./server/db/cache.sqlite
GRAPH_API_VERSION=v21.0
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

> **Finding your Instagram Business Account ID:**
> 1. `GET /me/accounts` → get your Facebook Page ID
> 2. `GET /{page_id}?fields=instagram_business_account` → copy the nested `id`

### Running Locally

```bash
# Install all dependencies (root + client + server)
npm install

# Start both frontend and backend
npm run dev
```

Frontend: **http://localhost:5173**  
Backend: **http://localhost:3001**

### Scripts

| Command | Action |
|---|---|
| `npm run dev` | Start client + server concurrently |
| `npm run dev:client` | Vite dev server only |
| `npm run dev:server` | Node server only (with --watch) |
| `npm run build` | Build client for production |
| `npm run start` | Start production server |

---

## Notes

- Business Discovery API only works for **Business or Creator** accounts — personal accounts are not discoverable.
- Access tokens expire (~60 days). Regenerate at [Graph API Explorer](https://developers.facebook.com/tools/explorer/).
- App auto-falls back to demo mode (Kusha Kapila mock data) if Meta credentials are missing or the token is invalid.
- ROAS model is calibrated to Lenskart's funnel: avg CTR 0.6%, avg ROAS 0.9×, top-performer ROAS 1.17×.
