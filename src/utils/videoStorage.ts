// Browser IndexedDB storage for large uploaded video masterclasses + URL embed helpers

const DB_NAME = 'bnc_lms_media_db';
const DB_VERSION = 1;
const STORE_NAME = 'lesson_videos';

export interface StoredLessonVideo {
  lessonId: string;
  blob: Blob;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  updatedAt: string;
}

function openVideoDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'lessonId' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open video database'));
  });
}

export async function saveLessonVideo(lessonId: string, file: File): Promise<StoredLessonVideo> {
  const db = await openVideoDb();
  const record: StoredLessonVideo = {
    lessonId,
    blob: file,
    fileName: file.name,
    mimeType: file.type || 'video/mp4',
    sizeBytes: file.size,
    updatedAt: new Date().toISOString()
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(record);
    req.onsuccess = () => resolve(record);
    req.onerror = () => reject(req.error || new Error('Failed to save video file'));
  });
}

export async function getLessonVideo(lessonId: string): Promise<StoredLessonVideo | null> {
  try {
    const db = await openVideoDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(lessonId);
      req.onsuccess = () => resolve((req.result as StoredLessonVideo) || null);
      req.onerror = () => reject(req.error || new Error('Failed to read video file'));
    });
  } catch (err) {
    console.warn('Video lookup error:', err);
    return null;
  }
}

export async function deleteLessonVideo(lessonId: string): Promise<void> {
  try {
    const db = await openVideoDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(lessonId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error || new Error('Failed to delete video file'));
    });
  } catch (err) {
    console.warn('Video delete error:', err);
  }
}

export function formatVideoFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 KB';
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function readVideoDurationFromFile(file: File): Promise<{ minutes: number; formatted: string } | null> {
  return new Promise((resolve) => {
    try {
      const tempUrl = URL.createObjectURL(file);
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        const secs = Math.round(video.duration || 0);
        URL.revokeObjectURL(tempUrl);
        if (!secs || !isFinite(secs)) {
          resolve(null);
          return;
        }
        const mins = Math.max(1, Math.round(secs / 60));
        const remSecs = secs % 60;
        const formatted =
          secs < 60
            ? `${secs} secs`
            : remSecs > 0
            ? `${Math.floor(secs / 60)}m ${remSecs}s`
            : `${mins} mins`;
        resolve({ minutes: mins, formatted });
      };
      video.onerror = () => {
        URL.revokeObjectURL(tempUrl);
        resolve(null);
      };
      video.src = tempUrl;
    } catch {
      resolve(null);
    }
  });
}

export function resolveVideoPlaybackSource(videoUrl?: string): {
  kind: 'none' | 'idb' | 'iframe' | 'direct';
  embedUrl?: string;
  idbLessonId?: string;
} {
  if (!videoUrl || !videoUrl.trim()) {
    return { kind: 'none' };
  }

  const trimmed = videoUrl.trim();
  if (trimmed.startsWith('idb://')) {
    return {
      kind: 'idb',
      idbLessonId: trimmed.replace('idb://', '')
    };
  }

  // YouTube standard / short / embed links
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/
  );
  if (ytMatch && ytMatch[1]) {
    return {
      kind: 'iframe',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`
    };
  }

  // Vimeo links
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      kind: 'iframe',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`
    };
  }

  // Google Drive preview link support
  const driveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveMatch && driveMatch[1]) {
    return {
      kind: 'iframe',
      embedUrl: `https://drive.google.com/file/d/${driveMatch[1]}/preview`
    };
  }

  // Direct mp4/webm/mov/stream URL
  return {
    kind: 'direct',
    embedUrl: trimmed
  };
}
