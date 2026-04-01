import { useEffect, useState } from 'react';
import * as VideoThumbnails from 'expo-video-thumbnails';

/**
 * Generate a thumbnail image from a video URI.
 * Returns the local file URI of the thumbnail, or null while loading / on error.
 */
export function useVideoThumbnail(videoUri: string | null | undefined): string | null {
  const [thumbnailUri, setThumbnailUri] = useState<string | null>(null);

  useEffect(() => {
    if (!videoUri) {
      setThumbnailUri(null);
      return;
    }

    let cancelled = false;

    void VideoThumbnails.getThumbnailAsync(videoUri, { time: 1000 }).then(
      (result) => {
        if (!cancelled) setThumbnailUri(result.uri);
      },
      () => {
        if (!cancelled) setThumbnailUri(null);
      },
    );

    return () => {
      cancelled = true;
    };
  }, [videoUri]);

  return thumbnailUri;
}
