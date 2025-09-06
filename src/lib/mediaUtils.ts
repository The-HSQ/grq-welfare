/**
 * Utility functions for handling media files and URLs
 */

/**
 * Convert a relative media path to a full URL
 * @param relativePath - The relative path (e.g., 'patient_images/image.jpg')
 * @param baseUrl - The base URL. If not provided, uses the current origin
 * @returns Full URL to the media file
 */
export function getFullMediaUrl(relativePath: string | null | undefined, baseUrl?: string): string | null {
  if (!relativePath) {
    return null;
  }

  // Remove leading slash if present
  const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;

  // Use provided base URL or current origin
  const base = baseUrl || "https://mzas.site";

  // Remove trailing slash from base URL if present
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;

  return `${cleanBase}/media/${cleanPath}`;
}

/**
 * Extract relative path from a full media URL
 * @param fullUrl - Full URL to the media file
 * @returns Relative path without domain and /media/ prefix
 */
export function getRelativeMediaPath(fullUrl: string | null | undefined): string | null {
  if (!fullUrl) {
    return null;
  }

  // Remove domain and /media/ prefix
  if (fullUrl.includes('/media/')) {
    return fullUrl.split('/media/')[1];
  }

  return fullUrl;
}

/**
 * Check if a path is relative (doesn't start with http:// or https://)
 * @param path - The path to check
 * @returns True if relative, false if absolute URL
 */
export function isRelativePath(path: string | null | undefined): boolean {
  if (!path) {
    return false;
  }

  return !(path.startsWith('http://') || path.startsWith('https://'));
}

/**
 * Get the current API base URL
 * @returns The current API base URL
 */
export function getApiBaseUrl(): string {
  // In development, this will be http://localhost:8000
  // In production, this will be the actual domain
  const apiUrl = import.meta.env.VITE_API_URL || "https://mzas.site";
  return apiUrl;
}

/**
 * Get the current server base URL (without /api suffix)
 * @returns The current server base URL
 */
export function getServerBaseUrl(): string {
  const apiUrl = getApiBaseUrl();
  // Remove /api suffix if present to get the server base URL
  return apiUrl.replace(/\/api$/, '');
}

/**
 * Convert a relative media path to a full URL using the server base URL
 * @param relativePath - The relative path
 * @returns Full URL to the media file
 */
export function getMediaUrl(relativePath: string | null | undefined): string | null {
  const serverBaseUrl = getServerBaseUrl();
  const fullUrl = getFullMediaUrl(relativePath, serverBaseUrl);
  return fullUrl;
}
