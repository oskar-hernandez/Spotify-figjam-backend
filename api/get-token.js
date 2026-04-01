// backend/api/get-token.js
// El plugin hace polling a este endpoint para obtener el token tras el login

// NOTA: En Vercel, cada función es stateless. Para un entorno real,
// usa Redis (Upstash) para compartir el estado entre invocaciones.
// Esta implementación usa una variable global que funciona en desarrollo local.

let tokenStore = null; // Se comparte con callback.js via require

export default function handler(req, res) {
  // Cabecera CORS para que el plugin pueda llamar desde el iframe de Figma
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Intenta leer el token del store
  // En producción, aquí harías: const data = await redis.get("spotify_token");
  const data = global.__spotifyToken;

  if (!data) {
    res.status(404).json({ error: "Token no disponible aún" });
    return;
  }

  res.status(200).json(data);
}
