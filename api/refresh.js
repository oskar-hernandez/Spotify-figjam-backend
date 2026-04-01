export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const redisRes = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/spotify_token`, {
    headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` }
  });
  const redisData = await redisRes.json();
  if (!redisData.result) { res.status(401).json({ error: "No hay token guardado" }); return; }

  const stored = JSON.parse(redisData.result);
  if (!stored.refresh_token) { res.status(401).json({ error: "No hay refresh token" }); return; }

  const credentials = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: stored.refresh_token }).toString(),
  });
  const data = await tokenRes.json();

  if (data.access_token) {
    const updated = { ...stored, access_token: data.access_token };
    await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/set/spotify_token`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ value: JSON.stringify(updated) })
    });
    res.status(200).json({ access_token: data.access_token, expires_in: data.expires_in });
  } else {
    res.status(500).json({ error: "No se pudo refrescar" });
  }
}
