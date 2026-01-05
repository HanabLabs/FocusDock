import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  
  // Get the origin from the request URL (works for both dev and prod)
  const url = new URL(request.url);
  const origin = url.origin;
  const redirectUri = `${origin}/integrations/github/callback`;
  
  const scope = 'repo';
  const state = Math.random().toString(36).substring(7);

  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${state}`;

  return NextResponse.json({ authUrl });
}

