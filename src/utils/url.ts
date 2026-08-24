import { API_BASE_URL } from '../config/env';

/**
 * Normalizes the API URL to ensure it ends with /api/v1 exactly once.
 *
 * @param url The base URL from environment variables
 * @returns Normalized API URL
 */
export const normalizeApiUrl = (url: string | undefined): string => {
    if (!url) return "";

    // Remove trailing slashes
    let normalized = url.replace(/\/+$/, "");

    // If it already ends with /api/v1, return it
    if (normalized.endsWith("/api/v1")) {
        return normalized;
    }

    // If it ends with /api, append /v1
    if (normalized.endsWith("/api")) {
        return `${normalized}/v1`;
    }

    // Otherwise, append /api/v1
    return `${normalized}/api/v1`;
};

export const BASE_API_URL = normalizeApiUrl(API_BASE_URL);
