// backend/api/refresh.js
// Renueva el access_token usando el refresh_token

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const stored = global.__spotifyToken;
  if (!stored?.refresh_token) {
    res.status(401).json({ error: "No hay refresh token disponible" });
    return;
  }

  const credentials = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: stored.refresh_token,
  });

  try {
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    const data = await tokenRes.json();

    if (data.access_token) {
      global.__spotifyToken = {
        ...stored,
        access_token: data.access_token,
        expires_in: data.expires_in,
        created_at: Date.now(),
      };
      res.status(200).json({
        access_token: data.access_token,
        expires_in: data.expires_in,
      });
    } else {
      res.status(500).json({ error: "No se pudo refrescar el token" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
