/**
 * Payload CMS JWT Authentication Helper
 *
 * Used by admin API proxy routes to authenticate with Payload API.
 */

const PAYLOAD_URL =
  process.env.PAYLOAD_API_URL || process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3001';

let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getPayloadToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.token;
  }

  const email = process.env.PAYLOAD_ADMIN_EMAIL || 'admin@bridgestone.ua';
  const password = process.env.PAYLOAD_ADMIN_PASSWORD || 'Admin123!';

  const response = await fetch(`${PAYLOAD_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(`Payload auth failed: ${response.status}`);
  }

  const data = await response.json();
  const token = data.token as string;

  // Cache for 1 hour (Payload default JWT expiry is 2 hours)
  cachedToken = {
    token,
    expiresAt: Date.now() + 60 * 60 * 1000,
  };

  return token;
}

export function getPayloadUrl(): string {
  return PAYLOAD_URL;
}
