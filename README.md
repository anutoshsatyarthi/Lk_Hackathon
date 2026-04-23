# Influencer Analyzer

A full-stack Instagram analytics tool that decodes any influencer's performance in seconds — powered by the Meta Graph API and Claude AI.

---

## Description

Influencer Analyzer lets you paste any public Instagram Business/Creator profile URL and instantly get a comprehensive breakdown of their content performance, brand collaborations, hashtag strategy, engagement trends, and VVIP network. It uses the Instagram Business Discovery API to fetch live data and Claude AI to detect brand deals and generate insights.

**Key capabilities:**
- Live Instagram data via Meta Business Discovery API
- AI-powered brand collaboration detection (Claude Sonnet)
- Engagement analytics with monthly trend breakdowns
- Post type breakdown (Reels, Images, Carousels, Collabs)
- Hashtag frequency analysis
- VVIP network mapping (notable followers & following)
- SQLite-backed caching to minimise API calls
- Graceful demo mode fallback when API is unavailable

---

## Metrics & Formulas

### Engagement Rate
The primary health metric for an account:

```
Engagement Rate (%) = ((Total Likes + Total Comments) / Number of Posts) / Followers × 100
```

### Average Likes / Comments / Views per Post
```
Avg Likes per Post     = Total Likes     / Total Posts
Avg Comments per Post  = Total Comments  / Total Posts
Avg Views per Post     = Total Video Views / Total Posts
```

### Post Type Breakdown
Posts are classified into four buckets based on `media_type` and `media_product_type` from the Graph API:

| Type | Detection Rule |
|---|---|
| **Reel** | `media_product_type = REELS` or `media_type = VIDEO` |
| **Carousel** | `media_type = CAROUSEL_ALBUM` |
| **Collab** | Caption contains "collab" or `media_product_type = BRANDED_CONTENT` |
| **Image** | All remaining posts |

```
Percentage = (Count of Type / Total Posts) × 100
```

### Monthly Engagement Trends
Posts are grouped by `YYYY-MM` from their `timestamp`. For each month:
```
Avg Likes     = Sum of likes in month     / Post count in month
Avg Comments  = Sum of comments in month  / Post count in month
Avg Views     = Sum of video views in month / Post count in month
```

### Hashtag Frequency
All `#hashtags` are extracted via regex from post captions, normalised to lowercase, and ranked by occurrence count across the last 50–200 posts.

### Top Posts
Posts are ranked by a weighted engagement score:
```
Score = Likes + (Comments × 2)
```
Comments are weighted higher as they signal stronger audience intent.

---

## Tech Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |
| Routing | React Router v6 |
| HTTP Client | Axios |

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js 20 |
| Framework | Express 4 |
| Instagram Data | Meta Graph API v21.0 (Business Discovery) |
| AI Analysis | Anthropic Claude Sonnet (`claude-sonnet-4-6`) |
| Cache / DB | SQLite (better-sqlite3) |
| Rate Limiting | express-rate-limit |
| Security | Helmet, CORS |

### Infrastructure
| Concern | Approach |
|---|---|
| Environment | dotenv with startup validation |
| Caching | SQLite with configurable TTL (default 60 min) |
| API resilience | Exponential backoff on rate-limit errors |
| Demo mode | Auto-activated when Meta credentials are missing |

---

## Setup

### Prerequisites
- Node.js 18+
- A Meta Developer App with `instagram_basic`, `instagram_manage_insights`, `pages_show_list`, `pages_read_engagement` permissions
- A Facebook Page linked to an Instagram Business/Creator account
- An Anthropic API key

### Environment Variables
Copy `.env.example` to `.env` and fill in:

```env
META_APP_ID=your_app_id
META_APP_SECRET=your_app_secret
META_ACCESS_TOKEN=your_long_lived_token
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_ig_business_account_id
ANTHROPIC_API_KEY=your_anthropic_key
```

> **Finding your Instagram Business Account ID:**
> 1. Call `GET /me/accounts` → get your Facebook Page ID
> 2. Call `GET /{page_id}?fields=instagram_business_account` → copy the nested `id`

### Running Locally

```bash
npm install
npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:3001

---

## Notes

- The Business Discovery API only works for **Business or Creator** Instagram accounts. Personal accounts are not discoverable.
- Access tokens expire — regenerate at [Graph API Explorer](https://developers.facebook.com/tools/explorer/) when needed.
- The app automatically falls back to demo data (Kusha Kapila mock dataset) if the live API is unavailable.
