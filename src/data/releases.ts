/**
 * Editable release data for SLAVYAN13 Music Portfolio.
 * Add, remove, or reorder releases here.
 */

export interface Release {
  id: string;
  title: string;
  subtitle: string;
  artwork: string;
  spotifyUrl: string;
}

export const SPOTIFY_ARTIST_URL = 'https://open.spotify.com/artist/1kWWTl7TWLqXfLPoyzXI86';

export const releases: Release[] = [
  {
    id: 'meow-boss',
    title: 'MEOW BOSS',
    subtitle: 'Single · 2026',
    artwork: '/covers/meow-boss.jpg',
    spotifyUrl: 'https://open.spotify.com/album/0dqDXUqpKaYu25rzyfBvEZ',
  },
  {
    id: 'meow-boss-hospital',
    title: 'MEOW BOSS HOSPITAL',
    subtitle: 'EP · 2026',
    artwork: '/covers/meow-boss-hospital.jpg',
    spotifyUrl: 'https://open.spotify.com/album/5cWszAPwSqaro8pl1WsxJ7',
  },
  {
    id: 'meow-boss-tekk',
    title: 'MEOW BOSS TEKK',
    subtitle: 'Single · 2026',
    artwork: '/covers/meow-boss-tekk.jpg',
    spotifyUrl: 'https://open.spotify.com/album/79FJWMYjUvujtn5L3EcVP2',
  },
  {
    id: 'meow-boss-remixes',
    title: 'MEOW BOSS (Mega Remixes)',
    subtitle: 'Remix Album · 2026',
    artwork: '/covers/meow-boss-remixes.jpg',
    spotifyUrl: 'https://open.spotify.com/album/4MiOrSY8lK3unkaWQmZN1C',
  },
];
