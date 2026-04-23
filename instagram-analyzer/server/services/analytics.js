class AnalyticsEngine {

  computeProfileMetrics(profile, media = []) {
    const followers = profile.followers_count || 0;
    const following = profile.follows_count || 0;
    const totalPosts = media.length || profile.media_count || 0;

    const totalLikes = media.reduce((s, p) => s + (p.like_count || 0), 0);
    const totalComments = media.reduce((s, p) => s + (p.comments_count || 0), 0);
    const totalViews = media.reduce((s, p) => s + (p.insights?.video_views || 0), 0);

    const avgLikesPerPost = totalPosts > 0 ? Math.round(totalLikes / totalPosts) : 0;
    const avgCommentsPerPost = totalPosts > 0 ? Math.round(totalComments / totalPosts) : 0;
    const avgViewsPerPost = totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0;

    const totalEngagement = totalLikes + totalComments;
    const engagementRate = followers > 0 && totalPosts > 0
      ? ((totalEngagement / totalPosts) / followers) * 100
      : 0;

    return {
      totalPosts,
      followers,
      following,
      engagementRate: parseFloat(engagementRate.toFixed(2)),
      avgLikesPerPost,
      avgCommentsPerPost,
      avgViewsPerPost,
      followerToFollowingRatio: following > 0 ? parseFloat((followers / following).toFixed(1)) : followers,
    };
  }

  computePostTypeBreakdown(media) {
    const counts = { IMAGE: 0, REEL: 0, CAROUSEL_ALBUM: 0, COLLAB: 0 };

    for (const post of media) {
      if (post.caption?.toLowerCase().includes('collab') || post.media_product_type === 'BRANDED_CONTENT') {
        counts.COLLAB++;
      } else if (post.media_product_type === 'REELS' || post.media_type === 'VIDEO') {
        counts.REEL++;
      } else if (post.media_type === 'CAROUSEL_ALBUM') {
        counts.CAROUSEL_ALBUM++;
      } else {
        counts.IMAGE++;
      }
    }

    const total = media.length || 1;
    return Object.entries(counts).map(([type, count]) => ({
      type,
      label: { IMAGE: 'Images', REEL: 'Reels', CAROUSEL_ALBUM: 'Carousels', COLLAB: 'Collabs' }[type],
      count,
      percentage: parseFloat(((count / total) * 100).toFixed(1)),
    }));
  }

  computeEngagementTrends(media) {
    const byMonth = {};

    for (const post of media) {
      if (!post.timestamp) continue;
      const d = new Date(post.timestamp);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!byMonth[key]) byMonth[key] = { likes: [], comments: [], views: [], count: 0 };
      byMonth[key].likes.push(post.like_count || 0);
      byMonth[key].comments.push(post.comments_count || 0);
      byMonth[key].views.push(post.insights?.video_views || 0);
      byMonth[key].count++;
    }

    const avg = (arr) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

    return Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, d]) => ({
        month,
        label: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        avgLikes: avg(d.likes),
        avgComments: avg(d.comments),
        avgViews: avg(d.views),
        postCount: d.count,
      }));
  }

  computeHashtagFrequency(media) {
    const freq = {};
    const hashtagRegex = /#(\w+)/g;

    for (const post of media) {
      if (!post.caption) continue;
      const matches = post.caption.match(hashtagRegex) || [];
      for (const tag of matches) {
        const clean = tag.toLowerCase();
        freq[clean] = (freq[clean] || 0) + 1;
      }
    }

    return Object.entries(freq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 25)
      .map(([tag, count]) => ({ tag, count }));
  }

  computeBrandEngagement(media, brandClassifications) {
    const brandMap = {};

    for (const collab of brandClassifications) {
      const brand = collab.brandName;
      if (!brand) continue;
      if (!brandMap[brand]) {
        brandMap[brand] = {
          brand,
          industry: collab.industry || 'Other',
          posts: [],
        };
      }
      const post = media.find((p) => p.id === collab.id);
      if (post) brandMap[brand].posts.push(post);
    }

    return Object.values(brandMap).map(({ brand, industry, posts }) => {
      if (!posts.length) return null;

      const likes = posts.map((p) => p.like_count || 0);
      const comments = posts.map((p) => p.comments_count || 0);
      const views = posts.map((p) => p.insights?.video_views || 0);
      const saves = posts.map((p) => p.insights?.saved || 0);
      const reach = posts.map((p) => p.insights?.reach || 0);

      const avg = (arr) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
      const sum = (arr) => arr.reduce((a, b) => a + b, 0);

      const avgLikes = avg(likes);
      const avgComments = avg(comments);
      const totalReach = sum(reach) || sum(likes) * 30; // estimate if no insight data
      const engagementRate = totalReach > 0
        ? parseFloat((((avgLikes + avgComments) / (totalReach / posts.length)) * 100).toFixed(2))
        : 0;

      const topPost = posts.reduce((best, p) => {
        const score = (p.like_count || 0) + (p.comments_count || 0) * 2;
        const bestScore = (best.like_count || 0) + (best.comments_count || 0) * 2;
        return score > bestScore ? p : best;
      }, posts[0]);

      const dates = posts.map((p) => new Date(p.timestamp)).sort((a, b) => a - b);
      const period = dates.length > 1
        ? `${dates[0].toLocaleDateString('en-US', { month: 'short', year: '2-digit' })} – ${dates[dates.length - 1].toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}`
        : dates[0]?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      return {
        brand,
        industry,
        postCount: posts.length,
        period,
        avgLikes,
        avgComments,
        avgViews: avg(views),
        avgShares: avg(saves),
        totalReach,
        engagementRate,
        topPost: {
          caption: (topPost.caption || '').slice(0, 200),
          likes: topPost.like_count || 0,
          comments: topPost.comments_count || 0,
          permalink: topPost.permalink,
          thumbnail: topPost.thumbnail_url || topPost.media_url,
        },
      };
    }).filter(Boolean).sort((a, b) => b.engagementRate - a.engagementRate);
  }

  computeTopPosts(media, limit = 5) {
    const scored = media.map((post) => {
      const likes = post.like_count || 0;
      const comments = post.comments_count || 0;
      const views = post.insights?.video_views || 0;
      const saves = post.insights?.saved || 0;
      const score = likes + comments * 2 + saves * 3 + views * 0.1;

      const hashtags = (post.caption || '').match(/#\w+/g) || [];

      return {
        id: post.id,
        score,
        thumbnail: post.thumbnail_url || post.media_url,
        caption: (post.caption || '').slice(0, 180),
        type: post.media_product_type === 'REELS' ? 'Reel' : post.media_type === 'CAROUSEL_ALBUM' ? 'Carousel' : 'Image',
        date: post.timestamp,
        permalink: post.permalink,
        likes,
        comments,
        views,
        saves,
        hashtags: hashtags.slice(0, 6),
      };
    });

    return scored.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  computePostingPatterns(media) {
    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const heatmap = Array.from({ length: 7 }, () => Array(24).fill(0));
    const counts = Array.from({ length: 7 }, () => Array(24).fill(0));

    for (const post of media) {
      if (!post.timestamp) continue;
      const d = new Date(post.timestamp);
      const day = d.getDay();
      const hour = d.getHours();
      const eng = (post.like_count || 0) + (post.comments_count || 0);
      heatmap[day][hour] += eng;
      counts[day][hour]++;
    }

    // Average engagement per slot
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        heatmap[d][h] = counts[d][h] > 0 ? Math.round(heatmap[d][h] / counts[d][h]) : 0;
      }
    }

    let bestDay = 0, bestHour = 0, bestVal = 0;
    for (let d = 0; d < 7; d++) {
      for (let h = 0; h < 24; h++) {
        if (heatmap[d][h] > bestVal) { bestVal = heatmap[d][h]; bestDay = d; bestHour = h; }
      }
    }

    return {
      bestDay: DAYS[bestDay],
      bestHour: `${bestHour}:00`,
      heatmap: heatmap.map((row, d) => ({ day: DAYS[d], hours: row })),
    };
  }
}

module.exports = AnalyticsEngine;
