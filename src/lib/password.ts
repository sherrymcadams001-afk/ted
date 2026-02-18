/**
 * Edge-compatible password hashing using Web Crypto API (PBKDF2).
 * Replaces bcryptjs which requires Node.js crypto module.
 *
 * Format: $pbkdf2$<iterations>$<base64-salt>$<base64-hash>
 */

const ITERATIONS = 100_000;
const KEY_LENGTH = 32; // 256 bits
const SALT_LENGTH = 16; // 128 bits

function toBase64(data: ArrayBuffer | Uint8Array): string {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(str: string): Uint8Array {
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function deriveKey(password: string, saltBytes: Uint8Array, iterations: number): Promise<ArrayBuffer> {
  const enc = new TextEncoder();
  // Ensure an ArrayBuffer-backed view for WebCrypto typings
  const salt = new Uint8Array(saltBytes);
  const saltBuffer = salt.buffer as ArrayBuffer;
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  return crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: saltBuffer, iterations, hash: "SHA-256" },
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
 * Supports only our PBKDF2 format.
 */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
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
