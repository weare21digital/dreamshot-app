import * as FileSystem from 'expo-file-system/legacy';

const CACHE_DIR = `${FileSystem.documentDirectory}dreamshot-gallery/`;

/** Ensure the cache directory exists */
async function ensureCacheDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(CACHE_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
  }
}

/**
 * If the URL is remote, download it to local cache and return the local URI.
 * If already local, return as-is.
 * Returns the original URL on download failure (non-fatal).
 */
export async function cacheRemoteImage(url: string, jobId: string): Promise<string> {
  if (!url || !url.startsWith('http')) return url;

  try {
    await ensureCacheDir();
    const ext = url.includes('.mp4') ? 'mp4' : url.includes('.png') ? 'png' : 'jpg';
    const localPath = `${CACHE_DIR}${jobId}.${ext}`;

    // Check if already cached
    const info = await FileSystem.getInfoAsync(localPath);
    if (info.exists) return localPath;

    const result = await FileSystem.downloadAsync(url, localPath);
    return result.uri;
  } catch {
    // Non-fatal — fall back to remote URL
    return url;
  }
}
