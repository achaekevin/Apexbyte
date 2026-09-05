import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

/**
 * Derives a consistent 32-byte encryption key from the environment
 */
const getEncryptionKey = (): Buffer => {
  const secret = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || 'default-fallback-encryption-key-32-chars!!';
  return crypto.createHash('sha256').update(secret).digest();
};

/**
 * Cryptographically hashes a token using SHA-256 before storing it in the database.
 * This ensures that even if the database is exposed, raw usable tokens are never leaked.
 */
export const hashToken = (token: string): string => {
  if (!token) return '';
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Encrypts sensitive data using AES-256-GCM authenticated encryption.
 * Output format: iv:ciphertext:tag (hex encoded)
 */
export const encrypt = (text: string): string => {
  if (!text) return '';

  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const tag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${encrypted}:${tag.toString('hex')}`;
};

/**
 * Decrypts AES-256-GCM encrypted data.
 */
export const decrypt = (encryptedData: string): string => {
  if (!encryptedData || !encryptedData.includes(':')) {
    return encryptedData;
  }

  const [ivHex, encryptedText, tagHex] = encryptedData.split(':');
  if (!ivHex || !encryptedText || !tagHex) {
    return encryptedData;
  }

  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const key = getEncryptionKey();

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

export default {
  hashToken,
  encrypt,
  decrypt,
};
