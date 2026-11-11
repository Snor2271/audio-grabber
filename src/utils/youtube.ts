/**
 * Utility functions for extracting YouTube video IDs, validating links,
 * and sanitizing download filenames.
 */

export interface ParsedLinkResult {
  raw: string;
  videoId: string | null;
  isValid: boolean;
  errorMessage?: string;
}

export type DownloadFormat = 'audio_m4a' | 'video_720p' | 'video_1080p';

export interface JobItem {
  id: string;
  videoId: string;
  url: string;
  format: DownloadFormat;
  status: 'waiting' | 'downloading' | 'ready' | 'error';
  progress: number;
  title: string;
  duration?: number;
  fileSize?: number;
  error?: string;
  errorDetails?: string;
  createdAt: number;
  readyAt?: number;
}

export interface SystemHealth {
  status: 'ok' | 'warning' | 'error';
  ytdlpVersion: string;
  ffmpegInstalled: boolean;
  ffmpegVersion?: string;
  nodeVersion: string;
  hasJsRuntime?: boolean;
  hostname?: string;
  activeJobs: number;
  waitingJobs: number;
  totalJobs: number;
  maxConcurrent: number;
  maxQueue: number;
  maxDurationSeconds: number;
  hasCookies: boolean;
  hasCookiesFromBrowser?: boolean;
  cookiesFromBrowser?: string | null;
  hasProxy: boolean;
}

// Regex to capture YouTube video ID from various URL patterns
// Supports:
// - https://www.youtube.com/watch?v=ID (and with additional params like &list=..., &t=...)
// - https://youtu.be/ID (shortened, with or without ?si=...)
// - https://m.youtube.com/watch?v=ID
// - https://music.youtube.com/watch?v=ID
// - https://www.youtube.com/shorts/ID
// - https://www.youtube.com/embed/ID
// - Or raw 11-char ID [A-Za-z0-9_-]{11}
const YOUTUBE_REGEX =
  /(?:https?:\/\/)?(?:www\.|m\.|music\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;

const RAW_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

/**
 * Parses a single line input and extracts a YouTube video ID.
 * Automatically ignores playlist parameter (&list=...).
 */
export function parseYouTubeLink(input: string): ParsedLinkResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      raw: input,
      videoId: null,
      isValid: false,
      errorMessage: 'Dòng trống',
    };
  }

  // Check if it's already a raw 11-character video ID
  if (RAW_ID_REGEX.test(trimmed)) {
    return {
      raw: trimmed,
      videoId: trimmed,
      isValid: true,
    };
  }

  // Check if it looks like a YouTube link
  const match = trimmed.match(YOUTUBE_REGEX);
  if (match && match[1]) {
    return {
      raw: trimmed,
      videoId: match[1],
      isValid: true,
    };
  }

  // Provide helpful Vietnamese error message based on input
  if (trimmed.includes('youtube.com/playlist') || trimmed.includes('list=')) {
    return {
      raw: trimmed,
      videoId: null,
      isValid: false,
      errorMessage: 'Chưa hỗ trợ tải nguyên danh sách phát (playlist), vui lòng dán link từng video.',
    };
  }

  if (trimmed.includes('facebook.com') || trimmed.includes('tiktok.com') || trimmed.includes('soundcloud.com')) {
    return {
      raw: trimmed,
      videoId: null,
      isValid: false,
      errorMessage: 'Chỉ hỗ trợ video từ YouTube (youtube.com hoặc youtu.be).',
    };
  }

  return {
    raw: trimmed,
    videoId: null,
    isValid: false,
    errorMessage: 'Đường dẫn không hợp lệ hoặc không tìm thấy mã video YouTube (11 ký tự).',
  };
}

/**
 * Parses multiple lines of text, returning validation results for each non-empty line.
 */
export function parseMultipleLinks(text: string): ParsedLinkResult[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  return lines.map(parseYouTubeLink);
}

/**
 * Cleans a video title into a safe filename for filesystem and Content-Disposition.
 * Preserves Vietnamese diacritics while removing dangerous filesystem characters.
 */
export function sanitizeFilename(name: string): string {
  if (!name) return 'audio';
  
  // Replace illegal filename chars: / \ : * ? " < > | \0
  let cleaned = name.replace(/[/\\:*?"<>|\0]/g, '-');
  
  // Replace multiple spaces/hyphens with single one
  cleaned = cleaned.replace(/\s+/g, ' ').replace(/-+/g, '-').trim();
  
  // Remove leading/trailing dots or hyphens
  cleaned = cleaned.replace(/^[.-]+|[.-]+$/g, '');
  
  // Truncate length to avoid max path limits
  if (cleaned.length > 120) {
    cleaned = cleaned.slice(0, 120).trim();
  }
  
  return cleaned || 'audio';
}

/**
 * Formats seconds into MM:SS or HH:MM:SS
 */
export function formatDuration(seconds?: number): string {
  if (!seconds || seconds <= 0) return '--:--';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formats byte size into human readable string (KB, MB)
 */
export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
