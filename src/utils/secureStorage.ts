import CryptoJS from 'crypto-js';

import { IS_SERVER, TOKEN_SECRET_KEY } from '../config/env';

/**
 * AES-encrypted token storage backed by sessionStorage.
 *
 * Every function is a no-op on the server: sessionStorage does not exist
 * there, and this module is imported (transitively) by the Redux store, so a
 * bare access would crash any server render.
 *
 * Note this key ships in the client bundle — it obfuscates the token at rest
 * in sessionStorage, it is not a secret. Real session security would require
 * httpOnly cookies issued by the API.
 */

const SECRET_KEY = TOKEN_SECRET_KEY;

/** Resolve the key lazily so a missing value fails at the call site rather
 * than throwing at module-evaluation time (which would take down the whole
 * app, including pages that never touch auth). */
function requireKey(): string | null {
  if (!SECRET_KEY) {
    console.error(
      'Token secret key missing. Set VITE_TOKEN_SECRET_KEY (Vite) or ' +
        'NEXT_PUBLIC_TOKEN_SECRET_KEY (Next) in your environment.'
    );
    return null;
  }
  return SECRET_KEY;
}

// Encrypt data before storing it in sessionStorage
export const encryptData = (data: unknown): string | null => {
  const key = requireKey();
  if (!key) return null;
  return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
};

// Decrypt data when retrieving it from sessionStorage
export const decryptData = (encryptedData: string): unknown => {
  const key = requireKey();
  if (!key) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};

// Save token securely in sessionStorage
export const saveToken = (token: string): void => {
  if (IS_SERVER) return;
  const encryptedToken = encryptData(token);
  if (encryptedToken) sessionStorage.setItem('authToken', encryptedToken);
};

// Retrieve token securely from sessionStorage
export const getToken = (): string | null => {
  if (IS_SERVER) return null;
  const encryptedToken = sessionStorage.getItem('authToken');
  return encryptedToken ? (decryptData(encryptedToken) as string) : null;
};

// Remove token from sessionStorage
export const removeToken = (): void => {
  if (IS_SERVER) return;
  sessionStorage.removeItem('authToken');
};
