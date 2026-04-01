// backend/api/callback.js
// Spotify llama a esta URL tras el login. Intercambia el código por un token.

// Almacenamiento simple en memoria (para producción usa Redis o similar)
let tokenStore = null;

export default async function handler(req, res) {
  const { code, error } = req.query;

  if (error) {
    res.status(400).send(`Error de autenticación: ${error}`);
    return;
  }

  if (!code) {
    res.status(400).send("Código de autorización no encontrado.");
    return;
  }

  // Intercambia el código por un access_token + refresh_token
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
  });

  const credentials = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

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
      // Guarda el token en memoria (el plugin lo leerá con /api/get-token)
      tokenStore = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
        created_at: Date.now(),
      };

      // Muestra página de éxito — el usuario puede cerrar esta ventana
      res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: sans-serif; background: #121212; color: #fff;
                   display: flex; flex-direction: column; align-items: center;
                   justify-content: center; height: 100vh; margin: 0; gap: 12px; }
            h2 { color: #1DB954; font-size: 22px; }
            p { color: #b3b3b3; font-size: 14px; }
          </style>
        </head>
        <body>
          <h2>✓ Conectado a Spotify</h2>
          <p>Puedes cerrar esta ventana y volver a FigJam.</p>
          <script>setTimeout(() => window.close(), 2000);</script>
        </body>
        </html>
      `);
    } else {
      res.status(500).json({ error: "No se pudo obtener el token.", details: data });
    }
  } catch (err) {
    res.status(500).json({ error: "Error de red", details: err.message });
  }
}

// Exporta el store para que otros endpoints puedan usarlo
export { tokenStore };
