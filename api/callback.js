export default async function handler(req, res) {
  const { code, error } = req.query;
  if (error) { res.status(400).send(`Error: ${error}`); return; }
  if (!code) { res.status(400).send("Código no encontrado."); return; }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: "https://spotify-figjam-backend-oskar-hernandezs-projects.vercel.app/api/callback",
  });

  res.json({ debug: {
    grant_type: "authorization_code",
    code_preview: code.substring(0, 20),
    redirect_uri: "https://spotify-figjam-backend-oskar-hernandezs-projects.vercel.app/api/callback",
    client_id: process.env.SPOTIFY_CLIENT_ID ? "OK" : "MISSING",
    client_secret: process.env.SPOTIFY_CLIENT_SECRET ? "OK" : "MISSING",
  }});
}
