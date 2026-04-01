export default async function handler(req, res) {
  const { code, error } = req.query;
  if (error) { res.status(400).send(`Error: ${error}`); return; }
  if (!code) { res.status(400).send("Código no encontrado."); return; }

  const credentials = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
  });

  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  const data = await tokenRes.json();

  if (data.access_token) {
    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    
    const redisRes = await fetch(`${redisUrl}/set/spotify_token/${encodeURIComponent(JSON.stringify(data))}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${redisToken}` }
    });
    const redisData = await redisRes.json();

    res.send(`<html><body style="font-family:sans-serif;background:#121212;color:#fff;padding:40px;">
      <h2 style="color:#1DB954">Debug info</h2>
      <p>Redis URL: ${redisUrl ? redisUrl.substring(0, 30) + '...' : 'MISSING'}</p>
      <p>Redis Token: ${redisToken ? 'OK' : 'MISS  }
}
