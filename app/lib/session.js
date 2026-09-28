// Signed, expiring session tokens for /dashboard auth, built on Web Crypto so
// this module works in both middleware (edge runtime) and server actions
// (node runtime). No third-party crypto library.

export const SESSION_COOKIE = 'auth-token';
export const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours

const KEY_INFO = 'dashboard-session-v1';
const encoder = new TextEncoder();

// Cache the derived HMAC key per secret value so repeated calls (e.g. many
// requests in the same lambda/edge instance) don't re-derive it every time.
let cachedKeyPromise = null;
let cachedSecret = null;

function getSigningKey() {
  const secret = process.env.DASHBOARD_SECRET;
  if (!secret) return null;

  if (cachedKeyPromise && cachedSecret === secret) {
    return cachedKeyPromise;
  }

  cachedSecret = secret;
  cachedKeyPromise = deriveKey(secret);
  return cachedKeyPromise;
}

async function deriveKey(secret) {
  // Derive a session-signing key from DASHBOARD_SECRET via HMAC, so the
  // session key is distinct from the raw password but still rotates
  // automatically if the password changes.
  const rootKey = await globalThis.crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const derivedBytes = await globalThis.crypto.subtle.sign('HMAC', rootKey, encoder.encode(KEY_INFO));

  return globalThis.crypto.subtle.importKey(
    'raw',
    derivedBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function base64urlEncode(bytes) {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecodeToBytes(str) {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (padded.length % 4)) % 4;
  const withPad = padded + '='.repeat(padLength);
  const binary = atob(withPad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function randomSessionId() {
  const bytes = new Uint8Array(16); // 128 bits
  globalThis.crypto.getRandomValues(bytes);
  return base64urlEncode(bytes);
}

/**
 * Creates a signed session token: base64url(JSON payload).base64url(signature)
 * Returns null if DASHBOARD_SECRET is not configured.
 */
export async function createSessionToken() {
  const key = await getSigningKey();
  if (!key) return null;

  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + SESSION_TTL_SECONDS;
  const payload = { sid: randomSessionId(), iat, exp };

  const payloadBytes = encoder.encode(JSON.stringify(payload));
  const payloadPart = base64urlEncode(payloadBytes);

  const sigBytes = new Uint8Array(
    await globalThis.crypto.subtle.sign('HMAC', key, encoder.encode(payloadPart))
  );
  const sigPart = base64urlEncode(sigBytes);

  return `${payloadPart}.${sigPart}`;
}

/**
 * Verifies a session token's signature and expiry.
 * Returns the payload ({ sid, iat, exp }) if valid, otherwise null.
 * Never throws on malformed input.
 */
export async function verifySessionToken(token) {
  try {
    if (!token || typeof token !== 'string') return null;

    const key = await getSigningKey();
    if (!key) return null; // fail closed if secret is missing

    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payloadPart, sigPart] = parts;
    if (!payloadPart || !sigPart) return null;

    let sigBytes;
    try {
      sigBytes = base64urlDecodeToBytes(sigPart);
    } catch {
      return null;
    }

    const valid = await globalThis.crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      encoder.encode(payloadPart)
    );
    if (!valid) return null;

    let payload;
    try {
      const payloadBytes = base64urlDecodeToBytes(payloadPart);
      payload = JSON.parse(new TextDecoder().decode(payloadBytes));
    } catch {
      return null;
    }

    if (
      !payload ||
      typeof payload.sid !== 'string' ||
      typeof payload.iat !== 'number' ||
      typeof payload.exp !== 'number'
    ) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now) return null;

    return payload;
  } catch {
    // Never throw on bad input; treat any unexpected error as unauthenticated.
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: SESSION_TTL_SECONDS,
};
