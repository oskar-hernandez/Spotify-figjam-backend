module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }

  const redisRes = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/get/spotify_token`, {
    headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` }
  });
  const redisData = await redisRes.json();

  if (!redisData.result) { res.status(404).json({ error: "Token no disponible" }); return; }

  const token = JSON.parse(decodeURIComponent(redisData.result));
  res.status(200).json(token);
};
