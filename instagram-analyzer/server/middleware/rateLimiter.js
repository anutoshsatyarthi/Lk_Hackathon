const rateLimit = require('express-rate-limit');

function createRateLimiter(config) {
  return rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Too many requests from this IP, please try again later.',
      type: 'rate_limit',
    },
    handler: (req, res, next, options) => {
      console.warn(`[RateLimit] ${req.ip} exceeded limit on ${req.path}`);
      res.status(429).json(options.message);
    },
  });
}

module.exports = createRateLimiter;
