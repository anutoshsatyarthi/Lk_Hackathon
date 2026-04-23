// Kusha Kapila approximate demo data — used when API keys are not configured

const DEMO_POSTS = [
  { id: 'p1', caption: 'South Delhi Girls vibes only 😂 #southdelhigirls #comedy #kushakapila', media_type: 'VIDEO', media_product_type: 'REELS', like_count: 124000, comments_count: 2800, timestamp: '2024-11-10T10:00:00Z', media_url: null, permalink: '#', thumbnail_url: null, insights: { video_views: 980000, reach: 1200000, saved: 18000 } },
  { id: 'p2', caption: 'Collab with @nykaa — new launch alert! 💄 #nykaa #beauty #ad', media_type: 'VIDEO', media_product_type: 'REELS', like_count: 89000, comments_count: 1600, timestamp: '2024-10-22T14:00:00Z', media_url: null, permalink: '#', thumbnail_url: null, insights: { video_views: 720000, reach: 900000, saved: 12000 } },
  { id: 'p3', caption: 'Netflix India watch party 🎬 #netflixindia #ad #sponsored', media_type: 'VIDEO', media_product_type: 'REELS', like_count: 167000, comments_count: 3400, timestamp: '2024-10-05T18:00:00Z', media_url: null, permalink: '#', thumbnail_url: null, insights: { video_views: 1400000, reach: 1800000, saved: 22000 } },
  { id: 'p4', caption: 'Zomato delivery girl era 🍕 #zomato #ad', media_type: 'VIDEO', media_product_type: 'REELS', like_count: 198000, comments_count: 4200, timestamp: '2024-09-18T12:00:00Z', media_url: null, permalink: '#', thumbnail_url: null, insights: { video_views: 1650000, reach: 2100000, saved: 28000 } },
  { id: 'p5', caption: 'Maybelline x Kusha 💋 #maybelline #ad #beauty', media_type: 'IMAGE', media_product_type: 'IMAGE', like_count: 72000, comments_count: 1100, timestamp: '2024-09-02T16:00:00Z', media_url: null, permalink: '#', thumbnail_url: null, insights: { reach: 480000, saved: 8000 } },
  { id: 'p6', caption: 'Bumble date prep 💛 #bumble #ad #dating', media_type: 'VIDEO', media_product_type: 'REELS', like_count: 112000, comments_count: 2200, timestamp: '2024-08-20T11:00:00Z', media_url: null, permalink: '#', thumbnail_url: null, insights: { video_views: 890000, reach: 1100000, saved: 15000 } },
  { id: 'p7', caption: 'Monsoon mood 🌧️ #reelsinstagram #fashion #ootd', media_type: 'IMAGE', media_product_type: 'IMAGE', like_count: 95000, comments_count: 1800, timestamp: '2024-08-10T09:00:00Z', media_url: null, permalink: '#', thumbnail_url: null, insights: { reach: 620000, saved: 10000 } },
  { id: 'p8', caption: 'Lakme collab ✨ #lakme #ad #beauty #makeup', media_type: 'CAROUSEL_ALBUM', media_product_type: 'CAROUSEL_ALBUM', like_count: 81000, comments_count: 1400, timestamp: '2024-07-25T15:00:00Z', media_url: null, permalink: '#', thumbnail_url: null, insights: { reach: 520000, saved: 9000 } },
  { id: 'p9', caption: 'Amazon Fashion haul 👗 #amazonindia #ad #fashion', media_type: 'VIDEO', media_product_type: 'REELS', like_count: 64000, comments_count: 980, timestamp: '2024-07-12T13:00:00Z', media_url: null, permalink: '#', thumbnail_url: null, insights: { video_views: 510000, reach: 680000, saved: 7500 } },
  { id: 'p10', caption: 'Comedy skit: Delhi aunty 😂 #comedy #kushakapila #reels', media_type: 'VIDEO', media_product_type: 'REELS', like_count: 210000, comments_count: 5100, timestamp: '2024-06-30T20:00:00Z', media_url: null, permalink: '#', thumbnail_url: null, insights: { video_views: 1850000, reach: 2300000, saved: 32000 } },
  { id: 'p11', caption: 'H&M India summer picks 🌸 #hmIndia #ad #fashion', media_type: 'IMAGE', media_product_type: 'IMAGE', like_count: 69000, comments_count: 1100, timestamp: '2024-06-15T10:00:00Z', media_url: null, permalink: '#', thumbnail_url: null, insights: { reach: 450000, saved: 7000 } },
  { id: 'p12', caption: 'Samsung Galaxy moments 📱 #samsung #ad #tech', media_type: 'VIDEO', media_product_type: 'REELS', like_count: 58000, comments_count: 800, timestamp: '2024-05-28T16:00:00Z', media_url: null, permalink: '#', thumbnail_url: null, insights: { video_views: 460000, reach: 600000, saved: 6000 } },
  { id: 'p13', caption: 'Sugar Cosmetics glow up 💄 #sugarpop #ad #beauty', media_type: 'VIDEO', media_product_type: 'REELS', like_count: 77000, comments_count: 1300, timestamp: '2024-05-10T14:00:00Z', media_url: null, permalink: '#', thumbnail_url: null, insights: { video_views: 610000, reach: 790000, saved: 9500 } },
  { id: 'p14', caption: 'boAt squad 🎧 #boatheads #ad #music', media_type: 'IMAGE', media_product_type: 'IMAGE', like_count: 62000, comments_count: 950, timestamp: '2024-04-22T12:00:00Z', media_url: null, permalink: '#', thumbnail_url: null, insights: { reach: 410000, saved: 6500 } },
  { id: 'p15', caption: 'Tinder date? Maybe 😏 #tinder #ad #comedy', media_type: 'VIDEO', media_product_type: 'REELS', like_count: 104000, comments_count: 2100, timestamp: '2024-04-05T18:00:00Z', media_url: null, permalink: '#', thumbnail_url: null, insights: { video_views: 830000, reach: 1050000, saved: 13000 } },
];

const DEMO_BRAND_COLLABS = [
  { brand: 'Netflix India', industry: 'Entertainment', postCount: 18, period: 'Jan 2023 – Oct 2024', avgLikes: 167000, avgComments: 3400, avgViews: 1400000, avgShares: 22000, totalReach: 25200000, engagementRate: 5.22, topPost: { caption: 'Netflix India watch party 🎬', likes: 167000, comments: 3400 } },
  { brand: 'Zomato', industry: 'Food', postCount: 8, period: 'Mar 2023 – Sep 2024', avgLikes: 198000, avgComments: 4200, avgViews: 1650000, avgShares: 28000, totalReach: 13200000, engagementRate: 5.92, topPost: { caption: 'Zomato delivery girl era 🍕', likes: 198000, comments: 4200 } },
  { brand: 'Tinder', industry: 'Entertainment', postCount: 7, period: 'Jun 2023 – Apr 2024', avgLikes: 104000, avgComments: 2100, avgViews: 830000, avgShares: 13000, totalReach: 7350000, engagementRate: 3.96, topPost: { caption: 'Tinder date? Maybe 😏', likes: 104000, comments: 2100 } },
  { brand: 'Bumble', industry: 'Entertainment', postCount: 10, period: 'Jan 2023 – Aug 2024', avgLikes: 112000, avgComments: 2200, avgViews: 890000, avgShares: 15000, totalReach: 11000000, engagementRate: 4.21, topPost: { caption: 'Bumble date prep 💛', likes: 112000, comments: 2200 } },
  { brand: 'Nykaa', industry: 'Beauty', postCount: 32, period: 'Jan 2022 – Nov 2024', avgLikes: 89000, avgComments: 1600, avgViews: 720000, avgShares: 12000, totalReach: 28800000, engagementRate: 3.58, topPost: { caption: 'Collab with @nykaa — new launch alert! 💄', likes: 89000, comments: 1600 } },
  { brand: 'Lakme', industry: 'Beauty', postCount: 14, period: 'Feb 2023 – Jul 2024', avgLikes: 81000, avgComments: 1400, avgViews: 0, avgShares: 9000, totalReach: 7280000, engagementRate: 3.31, topPost: { caption: 'Lakme collab ✨', likes: 81000, comments: 1400 } },
  { brand: 'Sugar Cosmetics', industry: 'Beauty', postCount: 11, period: 'Apr 2023 – May 2024', avgLikes: 77000, avgComments: 1300, avgViews: 610000, avgShares: 9500, totalReach: 8690000, engagementRate: 2.81, topPost: { caption: 'Sugar Cosmetics glow up 💄', likes: 77000, comments: 1300 } },
  { brand: 'Maybelline', industry: 'Beauty', postCount: 22, period: 'Jan 2022 – Sep 2024', avgLikes: 72000, avgComments: 1100, avgViews: 0, avgShares: 8000, totalReach: 10560000, engagementRate: 3.02, topPost: { caption: 'Maybelline x Kusha 💋', likes: 72000, comments: 1100 } },
  { brand: 'H&M India', industry: 'Fashion', postCount: 12, period: 'May 2023 – Jun 2024', avgLikes: 69000, avgComments: 1100, avgViews: 0, avgShares: 7000, totalReach: 5400000, engagementRate: 2.63, topPost: { caption: 'H&M India summer picks 🌸', likes: 69000, comments: 1100 } },
  { brand: 'Amazon Fashion', industry: 'Fashion', postCount: 15, period: 'Jan 2022 – Jul 2024', avgLikes: 64000, avgComments: 980, avgViews: 510000, avgShares: 7500, totalReach: 10200000, engagementRate: 2.51, topPost: { caption: 'Amazon Fashion haul 👗', likes: 64000, comments: 980 } },
  { brand: 'boAt', industry: 'Tech', postCount: 9, period: 'Mar 2023 – Apr 2024', avgLikes: 62000, avgComments: 950, avgViews: 0, avgShares: 6500, totalReach: 3690000, engagementRate: 2.29, topPost: { caption: 'boAt squad 🎧', likes: 62000, comments: 950 } },
  { brand: 'Samsung', industry: 'Tech', postCount: 6, period: 'Nov 2023 – May 2024', avgLikes: 58000, avgComments: 800, avgViews: 460000, avgShares: 6000, totalReach: 3600000, engagementRate: 2.04, topPost: { caption: 'Samsung Galaxy moments 📱', likes: 58000, comments: 800 } },
];

const DEMO_VVIP_FOLLOWING = [
  { username: 'ranveersingh', displayName: 'Ranveer Singh', category: 'Bollywood', followers: 46200000, isVerified: true },
  { username: 'kareenakapoorkhan', displayName: 'Kareena Kapoor Khan', category: 'Bollywood', followers: 12800000, isVerified: true },
  { username: 'priyankachopra', displayName: 'Priyanka Chopra', category: 'Bollywood', followers: 91000000, isVerified: true },
  { username: 'deepikapadukone', displayName: 'Deepika Padukone', category: 'Bollywood', followers: 80000000, isVerified: true },
  { username: 'masabagupta', displayName: 'Masaba Gupta', category: 'Fashion Designer', followers: 3200000, isVerified: true },
  { username: 'tanmaybhat', displayName: 'Tanmay Bhat', category: 'Creator', followers: 1800000, isVerified: true },
  { username: 'malaikaaroraofficial', displayName: 'Malaika Arora', category: 'Bollywood', followers: 21000000, isVerified: true },
  { username: 'smritiirani', displayName: 'Smriti Irani', category: 'Politician', followers: 5400000, isVerified: true },
  { username: 'dollysingh', displayName: 'Dolly Singh', category: 'Creator', followers: 1200000, isVerified: false },
];

const DEMO_VVIP_FOLLOWERS = [
  { username: 'komalpandeyofficial', displayName: 'Komal Pandey', category: 'Creator', followers: 2100000, isVerified: true },
  { username: 'shibanidandekar', displayName: 'Shibani Dandekar', category: 'Bollywood', followers: 3800000, isVerified: true },
  { username: 'farahkhankunder', displayName: 'Farah Khan', category: 'Bollywood', followers: 6200000, isVerified: true },
  { username: 'barkhadutt', displayName: 'Barkha Dutt', category: 'Journalist', followers: 1400000, isVerified: true },
  { username: 'awezdarbar', displayName: 'Awez Darbar', category: 'Creator', followers: 14000000, isVerified: true },
  { username: 'mallikadua', displayName: 'Mallika Dua', category: 'Comedian', followers: 1600000, isVerified: true },
];

function getProfile(username) {
  const isKusha = username.toLowerCase().includes('kusha');
  return {
    username: isKusha ? 'kushakapila' : username,
    fullName: isKusha ? 'Kusha Kapila' : username,
    biography: 'Content Creator | Actor | Comedy 🎭 / Ex-iDiva | South Delhi Girls 🍵 / Mumbai 🌴',
    website: 'https://linktr.ee/kushakapila',
    profilePicUrl: null,
    followers: 4800000,
    following: 1420,
    mediaCount: 3240,
    metrics: {
      totalPosts: 3240,
      followers: 4800000,
      following: 1420,
      engagementRate: 3.02,
      avgLikesPerPost: 102000,
      avgCommentsPerPost: 2100,
      avgViewsPerPost: 890000,
      followerToFollowingRatio: 3380.3,
    },
  };
}

function getMedia(username) {
  const postTypes = [
    { type: 'REEL', label: 'Reels', count: 1340, percentage: 41.4 },
    { type: 'IMAGE', label: 'Images', count: 1180, percentage: 36.4 },
    { type: 'CAROUSEL_ALBUM', label: 'Carousels', count: 520, percentage: 16.0 },
    { type: 'COLLAB', label: 'Collabs', count: 200, percentage: 6.2 },
  ];

  const hashtags = [
    { tag: '#kushakapila', count: 480 },
    { tag: '#southdelhigirls', count: 340 },
    { tag: '#comedy', count: 295 },
    { tag: '#reelsinstagram', count: 260 },
    { tag: '#fashion', count: 228 },
    { tag: '#ootd', count: 195 },
    { tag: '#bollywood', count: 172 },
    { tag: '#beauty', count: 158 },
    { tag: '#ad', count: 144 },
    { tag: '#mumbai', count: 132 },
    { tag: '#delhigirl', count: 118 },
    { tag: '#collab', count: 104 },
  ];

  const trends = [
    { month: '2024-01', label: 'Jan\'24', avgLikes: 88000, avgComments: 1800, avgViews: 720000, postCount: 12 },
    { month: '2024-02', label: 'Feb\'24', avgLikes: 92000, avgComments: 1950, avgViews: 780000, postCount: 10 },
    { month: '2024-03', label: 'Mar\'24', avgLikes: 97000, avgComments: 2100, avgViews: 820000, postCount: 14 },
    { month: '2024-04', label: 'Apr\'24', avgLikes: 103000, avgComments: 2200, avgViews: 870000, postCount: 11 },
    { month: '2024-05', label: 'May\'24', avgLikes: 99000, avgComments: 2050, avgViews: 840000, postCount: 13 },
    { month: '2024-06', label: 'Jun\'24', avgLikes: 118000, avgComments: 2400, avgViews: 980000, postCount: 15 },
    { month: '2024-07', label: 'Jul\'24', avgLikes: 108000, avgComments: 2200, avgViews: 910000, postCount: 12 },
    { month: '2024-08', label: 'Aug\'24', avgLikes: 112000, avgComments: 2300, avgViews: 940000, postCount: 11 },
    { month: '2024-09', label: 'Sep\'24', avgLikes: 124000, avgComments: 2600, avgViews: 1050000, postCount: 13 },
    { month: '2024-10', label: 'Oct\'24', avgLikes: 131000, avgComments: 2750, avgViews: 1120000, postCount: 14 },
    { month: '2024-11', label: 'Nov\'24', avgLikes: 127000, avgComments: 2680, avgViews: 1080000, postCount: 10 },
  ];

  return {
    posts: DEMO_POSTS,
    postTypes,
    hashtags,
    topPosts: DEMO_POSTS.slice(0, 5).map((p, i) => ({
      ...p,
      score: (p.like_count || 0) + (p.comments_count || 0) * 2,
      type: p.media_product_type === 'REELS' ? 'Reel' : p.media_type === 'CAROUSEL_ALBUM' ? 'Carousel' : 'Image',
      date: p.timestamp,
      hashtags: (p.caption || '').match(/#\w+/g) || [],
    })),
    engagementTrends: trends,
    postingPatterns: {
      bestDay: 'Wednesday',
      bestHour: '20:00',
      heatmap: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((day) => ({
        day,
        hours: Array.from({ length: 24 }, (_, h) => Math.floor(Math.random() * 5000 + (h >= 19 && h <= 22 ? 8000 : 0))),
      })),
    },
  };
}

function getAnalysis(username) {
  return {
    brands: DEMO_BRAND_COLLABS,
    vvipFollowing: DEMO_VVIP_FOLLOWING,
    vvipFollowers: DEMO_VVIP_FOLLOWERS,
    insights: {
      bestPostingTimes: [
        { day: 'Wednesday', hours: '7-10pm', avgEngagement: 9800 },
        { day: 'Sunday', hours: '11am-1pm', avgEngagement: 8200 },
        { day: 'Friday', hours: '8-10pm', avgEngagement: 7600 },
      ],
      topContentThemes: [
        { theme: 'Comedy skits (South Delhi Girls)', avgLikes: 142000, avgComments: 3200 },
        { theme: 'Brand collaborations (Beauty/Fashion)', avgLikes: 87000, avgComments: 1600 },
        { theme: 'Fashion & OOTDs', avgLikes: 95000, avgComments: 1900 },
      ],
      captionInsights: {
        idealLength: '80-150 characters',
        emojiImpact: 'High — 3-5 emojis correlates with +18% engagement',
        ctaEffectiveness: 'Questions in captions increase comments by ~35%',
      },
      contentTypePerformance: [
        { type: 'Reels', avgEngagement: 112000 },
        { type: 'Carousel', avgEngagement: 78000 },
        { type: 'Image', avgEngagement: 65000 },
      ],
      recommendations: [
        'Post Reels on Wednesday evenings for maximum reach — your data shows 40% higher views vs. weekday mornings.',
        'Comedy skits outperform brand content 2.3x — consider negotiating Reel-format brand deals over static images.',
        'Increase question-based captions: posts ending with a question get 35% more comments on average.',
      ],
    },
  };
}

function getInsights(username) {
  return { note: 'Demo mode — account-level insights require your own IG account token', data: [] };
}

function getNetwork(username) {
  return { vvipFollowing: DEMO_VVIP_FOLLOWING, vvipFollowers: DEMO_VVIP_FOLLOWERS };
}

module.exports = { getProfile, getMedia, getAnalysis, getInsights, getNetwork };
