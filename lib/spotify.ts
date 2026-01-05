/**
 * Spotify API utilities
 */

export interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

/**
 * Refresh Spotify access token using refresh token
 */
export async function refreshSpotifyToken(refreshToken: string): Promise<string> {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
      ).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to refresh Spotify token: ${error.error_description || error.error}`);
  }

  const data: SpotifyTokenResponse = await response.json();
  return data.access_token;
}

/**
 * Get valid Spotify access token (refresh if needed)
 */
export async function getValidSpotifyToken(
  accessToken: string,
  refreshToken: string
): Promise<string> {
  // Try to use current token first
  const testResponse = await fetch('https://api.spotify.com/v1/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (testResponse.ok) {
    return accessToken;
  }

  // Token expired, refresh it
  return refreshSpotifyToken(refreshToken);
}

