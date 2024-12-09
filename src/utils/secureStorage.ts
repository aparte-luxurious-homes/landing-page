import CryptoJS from 'crypto-js';

// Secret Key from Environment Variables
const SECRET_KEY = import.meta.env.VITE_TOKEN_SECRET_KEY;

if (!SECRET_KEY) {
  throw new Error('Secret key not found. Please set REACT_APP_TOKEN_SECRET_KEY in your environment variables.');
}

// Encrypt data before storing it in sessionStorage
export const encryptData = (data: unknown): string => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

// Decrypt data when retrieving it from sessionStorage
export const decryptData = (encryptedData: string): unknown => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};

// Save token securely in sessionStorage
export const saveToken = (token: string): void => {
  const encryptedToken = encryptData(token);
  sessionStorage.setItem('authToken', encryptedToken);
};

// Retrieve token securely from sessionStorage
export const getToken = (): string | null => {
  const encryptedToken = sessionStorage.getItem('authToken');
  return encryptedToken ? (decryptData(encryptedToken) as string) : null;
};

// Remove token from sessionStorage
export const removeToken = (): void => {
  sessionStorage.removeItem('authToken');
};
