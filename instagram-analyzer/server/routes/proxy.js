const express = require('express');
const https = require('https');
const http = require('http');
const router = express.Router();

// Proxy Instagram CDN images to avoid CORS / referrer blocks in the browser
router.get('/image', (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'url required' });

  let decoded;
  try {
    decoded = decodeURIComponent(url);
    new URL(decoded); // validate
  } catch {
    return res.status(400).json({ error: 'invalid url' });
  }

  // Only proxy Instagram / Facebook CDN domains
  const allowed = /\.(cdninstagram\.com|fbcdn\.net|instagram\.com)(\/|$)/i;
  if (!allowed.test(decoded)) {
    return res.status(403).json({ error: 'domain not allowed' });
  }

  const lib = decoded.startsWith('https') ? https : http;
  const upstream = lib.get(
    decoded,
    {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Referer: 'https://www.instagram.com/',
        Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      },
    },
    (upstream_res) => {
      if (upstream_res.statusCode !== 200) {
        return res.status(upstream_res.statusCode).end();
      }
      res.setHeader('Content-Type', upstream_res.headers['content-type'] || 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      upstream_res.pipe(res);
    }
  );

  upstream.on('error', () => res.status(502).end());
});

module.exports = router;
