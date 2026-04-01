export default async function handler(req, res) {
  const { code, error } = req.query;
  if (error) { res.status(400).send(`Error: ${error}`); return; }
  if (!code) { res.status(400).send("Código no encontrado."); return; }

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  const checkRes = await fetch(`${redisUrl}/get/spotify_code_${code.substring(0, 10)}`, {
    headers: { Authorization: `Bearer ${redisToken}` }
  });
  const checkData = await checkRes.json();
  if (checkData.result) {
    res.send(`<html><body style="font-family:sans-serif;background:#121212;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column;gap:12px">
      <h2 style="color:#1DB954">Ya conectado</h2>
      <p style="color:#b3b3b3">Puedes cerrar esta ventana.</p>
    </body></html>`);
    return;
  }

  await fetch(`${redisUrl}/set/spotify_code_${code.substring(0, 10)}/used/ex/60`, {
    method: "GET",
    headers: { Authorization: `Bearer ${redisToken}` }
  });

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
    await fetch(`${redisUrl}/set/spotify_token/${encodeURIComponent(JSON.stringify(data))}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${redisToken}` }
    });

    res.send(`<html><body style="font-family:sans-serif;background:#121212;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column;gap:12px">
      <h2 style="color:#1DB954">Conectado a Spotify</h2>
      <p style="color:#b3b3b3">Puedes cerrar esta ventana y volver a FigJam.</p>
    </body></html>`);
  } else {
    res.status(500).json({ error: "No se pudo obtener el token.", details: data });
  }
}      <p>Redis response: ${JSON.stringify(redisData)}</p>
      <p>Token OK: ${data.access_token ? 'YES' : 'NO'}</p>
    </body></html>`);
  } else {
    res.status(500).json({ error: "No se pudo obtener el token", details: data });
  }
}
