module.exports = function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  const data = global.__spotifyToken;
  if (!data) { res.status(404).json({ error: "Token no disponible" }); return; }
  res.status(200).json(data);
};
