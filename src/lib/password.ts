/**
 * Edge-compatible password hashing using Web Crypto API (PBKDF2).
 * Replaces bcryptjs which requires Node.js crypto module.
 *
 * Format: $pbkdf2$<iterations>$<base64-salt>$<base64-hash>
 */

const ITERATIONS = 100_000;
const KEY_LENGTH = 32; // 256 bits
const SALT_LENGTH = 16; // 128 bits

function toBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function fromBase64(str: string): Uint8Array {
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function deriveKey(password: string, salt: Uint8Array, iterations: number): Promise<ArrayBuffer> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  return crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    keyMaterial,
    KEY_LENGTH * 8
  );
}

/**
 * Hash a password. Returns a string in the format:
 * $pbkdf2$100000$<base64-salt>$<base64-hash>
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const hash = await deriveKey(password, salt, ITERATIONS);
  return `$pbkdf2$${ITERATIONS}$${toBase64(salt)}$${toBase64(hash)}`;
}

/**
 * Compare a plain-text password against a stored hash.
 * Supports both our PBKDF2 format and legacy bcrypt hashes
 * (bcrypt hashes always start with $2b$ or $2a$).
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  // Handle legacy bcrypt hashes — do a constant-time comparison
  // by re-deriving from a known test. For bcrypt we need the bcryptjs
  // fallback which we lazy-import only when needed (server-side only).
  if (stored.startsWith("$2b$") || stored.startsWith("$2a$")) {
    try {
      // Dynamic import so it's only loaded when encountering legacy hashes
      const { compare } = await import("bcryptjs");
      return compare(password, stored);
    } catch {
      // If bcryptjs isn't available (edge), reject legacy hashes
      return false;
    }
  }

  // Our PBKDF2 format: $pbkdf2$<iterations>$<salt>$<hash>
  const parts = stored.split("$");
  // parts: ["", "pbkdf2", iterations, salt, hash]
  if (parts.length !== 5 || parts[1] !== "pbkdf2") return false;

  const iterations = parseInt(parts[2], 10);
  const salt = fromBase64(parts[3]);
  const expectedHash = fromBase64(parts[4]);

  const derivedHash = new Uint8Array(await deriveKey(password, salt, iterations));

  // Constant-time comparison
  if (derivedHash.length !== expectedHash.length) return false;
  let diff = 0;
  for (let i = 0; i < derivedHash.length; i++) {
    diff |= derivedHash[i] ^ expectedHash[i];
  }
  return diff === 0;
}
