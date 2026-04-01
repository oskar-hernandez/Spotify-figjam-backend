// backend/api/auth.js
// Redirige al usuario a la pantalla de login de Spotify

export default function handler(req, res) {
  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID,
    response_type: "code",
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    scope: "user-read-playback-state user-modify-playback-state user-read-currently-playing",
    show_dialog: "true",
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
}
