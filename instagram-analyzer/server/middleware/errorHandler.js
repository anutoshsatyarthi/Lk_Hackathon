const GRAPH_API_ERROR_MAP = {
  190: 'Instagram access token is invalid or expired. Please generate a new token at https://developers.facebook.com/tools/explorer/',
  4: 'Instagram API rate limit reached. Please wait before making more requests.',
  10: 'Missing required Instagram API permission. Check your app permissions in the Meta Developer Console.',
  100: 'Invalid parameter sent to Instagram API.',
  200: 'Instagram API permission denied.',
  368: 'Instagram account has been temporarily blocked from this action.',
  17: 'Instagram API user request limit reached.',
  32: 'Instagram API page-level rate limit reached.',
  341: 'Instagram API application limit reached.',
};

function graphApiErrorMessage(code) {
  return GRAPH_API_ERROR_MAP[code] || `Instagram API error (code ${code}). Check server logs for details.`;
}

function errorHandler(err, req, res, next) {
  console.error('[Error]', err.message, err.stack?.split('\n')[1] || '');

  // Graph API errors
  if (err.graphCode) {
    return res.status(400).json({
      error: graphApiErrorMessage(err.graphCode),
      code: err.graphCode,
      type: 'graph_api_error',
    });
  }

  // Axios errors from Graph API
  if (err.response?.data?.error) {
    const { message, code, type } = err.response.data.error;
    return res.status(400).json({
      error: graphApiErrorMessage(code) || message,
      code,
      type: 'graph_api_error',
    });
  }

  if (err.status === 404 || err.message?.includes('not found')) {
    return res.status(404).json({ error: 'Resource not found', type: 'not_found' });
  }

  if (err.status === 429) {
    return res.status(429).json({ error: 'Too many requests. Please slow down.', type: 'rate_limit' });
  }

  res.status(500).json({
    error: 'An internal server error occurred. Please try again.',
    type: 'server_error',
  });
}

module.exports = errorHandler;
