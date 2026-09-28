import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";

const KEY_LENGTH = 64;
const PARAMS: ScryptOptions = { N: 16384, r: 8, p: 1 };

function derive(password: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(password.normalize("NFKC"), salt, KEY_LENGTH, PARAMS, (error, key) =>
      error ? reject(error) : resolve(key),
    );
  });
}

/** Format: `scrypt$<salt b64>$<key b64>`. */
export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await derive(password, salt);
  return `scrypt$${salt.toString("base64")}$${key.toString("base64")}`;
}

const DUMMY_HASH = `scrypt$${Buffer.alloc(16).toString("base64")}$${Buffer.alloc(KEY_LENGTH).toString("base64")}`;

/** Still hashes when `stored` is null so unknown emails take as long as wrong passwords. */
export async function verifyPassword(password: string, stored: string | null | undefined) {
  const [scheme, saltB64, keyB64] = (stored ?? DUMMY_HASH).split("$");
  if (scheme !== "scrypt" || !saltB64 || !keyB64) return false;
  const expected = Buffer.from(keyB64, "base64");
  const actual = await derive(password, Buffer.from(saltB64, "base64"));
  return Boolean(stored) && expected.length === actual.length && timingSafeEqual(expected, actual);
}
