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
    const redisRes = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/set/spotify_token`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ value: JSON.stringify(data) })
    });
    const redisData = await redisRes.json();

    res.send(`<html><body style="font-family:sans-serif;background:#121212;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column;gap:12px">
      <h2 style="color:#1DB954">Conectado a Spotify</h2>
      <p style="color:#b3b3b3">Puedes cerrar esta ventana.</p>
      <p style="color:#666;font-size:11px;">Redis: ${JSON.stringify(redisData)}</p>
      <script>setTimeout(()=>window.close(),2000)</script>
    </body></html>`);
  } else {
    res.status(500).json({ error: "No se pudo obtener el token", details: data });
  }
}
