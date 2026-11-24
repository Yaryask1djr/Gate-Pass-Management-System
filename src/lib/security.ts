import crypto from "crypto";

const AUTH_SECRET = process.env.AUTH_SECRET || "passguard_super_secure_jwt_session_secret_2026";

// ============================================================================
// 1. CRYPTOGRAPHIC PASSWORD HASHING (Scrypt + Salt + Timing-Safe Comparison)
// ============================================================================

/**
 * Hashes a plaintext password using Node.js scrypt with a cryptographically secure random salt.
 * Output format: `scrypt$salt$hash`
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt}$${derivedKey.toString("hex")}`;
}

/**
 * Verifies a plaintext password against a stored hash using constant-time comparison.
 * Supports backward-compatible check for legacy mock passwords ("pass123").
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash) return false;

  // Modern scrypt format: scrypt$salt$hash
  if (storedHash.startsWith("scrypt$")) {
    const parts = storedHash.split("$");
    if (parts.length !== 3) return false;
    const salt = parts[1];
    const key = parts[2];
    const derivedKey = crypto.scryptSync(password, salt, 64);
    const keyBuffer = Buffer.from(key, "hex");
    if (keyBuffer.length !== derivedKey.length) return false;
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  }

  // Backward compatibility for pre-seeded development accounts
  const passBuf = Buffer.from(password);
  const hashBuf = Buffer.from(storedHash);
  if (passBuf.length !== hashBuf.length) return false;
  return crypto.timingSafeEqual(passBuf, hashBuf);
}

// ============================================================================
// 2. CRYPTOGRAPHICALLY SECURE TOKENS & IDENTIFIERS
// ============================================================================

/**
 * Generates an unguessable 256-bit cryptographically secure session identifier.
 */
export function generateSecureSessionToken(prefix = "sess"): string {
  const randomHex = crypto.randomBytes(32).toString("hex");
  return `${prefix}_${randomHex}`;
}

// ============================================================================
// 3. HMAC-SHA256 PARENT CONSENT SIGNATURES
// ============================================================================

/**
 * Signs a parent 1-tap consent URL parameter payload to prevent URL enumeration and tampering.
 */
export function generateConsentHmac(passId: string, action: string): string {
  return crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(`${passId}:${action.toLowerCase()}`)
    .digest("hex")
    .substring(0, 32);
}

/**
 * Validates the HMAC signature on an incoming parent consent URL in constant time.
 */
export function verifyConsentHmac(passId: string, action: string, token: string): boolean {
  if (!token) return false;
  const expected = generateConsentHmac(passId, action);
  const tokenBuf = Buffer.from(token);
  const expectedBuf = Buffer.from(expected);
  if (tokenBuf.length !== expectedBuf.length) return false;
  return crypto.timingSafeEqual(tokenBuf, expectedBuf);
}

// ============================================================================
// 4. RESILIENT SLIDING-WINDOW RATE LIMITER
// ============================================================================

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Enforces sliding-window rate limiting per IP or user key.
 * @returns { allowed: boolean, remaining: number, resetMs: number }
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  const windowStart = now - windowMs;

  let record = rateLimitStore.get(key);
  if (!record) {
    record = { timestamps: [] };
    rateLimitStore.set(key, record);
  }

  // Filter out expired timestamps outside the current window
  record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

  if (record.timestamps.length >= maxRequests) {
    const oldest = record.timestamps[0];
    const resetMs = Math.max(0, oldest + windowMs - now);
    return { allowed: false, remaining: 0, resetMs };
  }

  record.timestamps.push(now);

  // Evict stale keys periodically if store grows
  if (rateLimitStore.size > 10000) {
    for (const [k, v] of rateLimitStore.entries()) {
      v.timestamps = v.timestamps.filter((ts) => ts > windowStart);
      if (v.timestamps.length === 0) rateLimitStore.delete(k);
    }
  }

  return {
    allowed: true,
    remaining: maxRequests - record.timestamps.length,
    resetMs: windowMs,
  };
}
