export default async function handler(req, res) {
  const { code, error } = req.query;
  
  res.json({
    hasCode: !!code,
    hasError: !!error,
    error: error || null,
    codePreview: code ? code.substring(0, 20) + '...' : null,
    clientId: process.env.SPOTIFY_CLIENT_ID ? 'OK' : 'MISSING',
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET ? 'OK' : 'MISSING',
    redirectUri: process.env.SPOTIFY_REDIRECT_URI,
  });
}
