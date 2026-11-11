/**
 * Utility functions for smart YouTube metadata parsing,
 * title/artist extraction, Vietnamese title-casing, genre auto-detection,
 * and filename generation per user template: "Tên Tác Giả - Tên Bài Hát (Thể loại).đuôi"
 */

export const GENRE_OPTIONS = [
  'Bản gốc',
  'Drill',
  'Lofi',
  'Remix',
  'Acoustic',
  'Cover',
  'Live',
  'Slowed',
  'Sped up',
  'Piano',
  'Mashup',
  'Bolero',
  'Mixtape',
  'Nightcore',
] as const;

export type GenreType = (typeof GENRE_OPTIONS)[number] | string;

const KNOWN_ACRONYMS: Record<string, string> = {
  dj: 'DJ',
  mv: 'MV',
  ost: 'OST',
  edm: 'EDM',
  mc: 'MC',
  vip: 'VIP',
  bpm: 'BPM',
  tv: 'TV',
  hd: 'HD',
  '4k': '4K',
  remix: 'Remix',
  ft: 'ft.',
  'ft.': 'ft.',
  feat: 'feat.',
  'feat.': 'feat.',
  prod: 'Prod.',
  'prod.': 'Prod.',
};

/**
 * Removes Vietnamese diacritical marks to produce a clean ASCII string
 * for fallback filename="..." in Content-Disposition headers.
 */
export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, (c) => (c === 'đ' ? 'd' : 'D'))
    .replace(/[^a-zA-Z0-9.\-_ ()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Cleans YouTube clutter phrases (Official Music Video, Lyrics, 4K, emojis, etc.)
 * while preserving ft./feat. collaborations.
 */
export function cleanTitle(rawTitle: string): string {
  if (!rawTitle) return '';

  let cleaned = rawTitle.normalize('NFC');

  // Remove common bracketed/parenthesized noise
  const clutterRegexes = [
    /\((?:official\s+)?(?:music\s+video|mv|audio|lyrics?|lyric\s+video|visualizer|live\s+performance|video\s+clip|video|clip|bản\s+chuẩn)\)/gi,
    /\[(?:official\s+)?(?:music\s+video|mv|audio|lyrics?|lyric\s+video|visualizer|live\s+performance|video\s+clip|video|clip|bản\s+chuẩn)\]/gi,
    /【(?:official\s+)?(?:music\s+video|mv|audio|lyrics?|lyric\s+video|visualizer|live\s+performance|video\s+clip|video|clip)】/gi,
    /\b(?:official\s+music\s+video|official\s+audio|official\s+mv|lyric\s+video)\b/gi,
    /\b(?:4k|hd|full\s*hd|1080p|720p)\b/gi,
  ];

  for (const regex of clutterRegexes) {
    cleaned = cleaned.replace(regex, ' ');
  }

  // Remove emojis
  cleaned = cleaned.replace(
    /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}]/gu,
    ''
  );

  // Clean empty brackets left behind like () or []
  cleaned = cleaned.replace(/\(\s*\)/g, ' ').replace(/\[\s*\]/g, ' ');

  // Standardize multiple spaces and hyphens
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  cleaned = cleaned.replace(/^[ -]+|[ -]+$/g, '').trim();

  return cleaned || rawTitle;
}

/**
 * Automatically detects music genre from keywords in the title.
 * Returns "Bản gốc" if no genre keyword is found.
 */
export function detectGenre(title: string): string {
  if (!title) return 'Bản gốc';
  const lower = title.toLowerCase();

  if (/\bdrill\b/i.test(lower)) return 'Drill';
  if (/\b(?:lo-?fi|lofi)\b/i.test(lower)) return 'Lofi';
  if (/\bremix\b/i.test(lower)) return 'Remix';
  if (/\bacoustic\b/i.test(lower)) return 'Acoustic';
  if (/\bcover\b/i.test(lower)) return 'Cover';
  if (/\blive(?:\s+session|\s+stage|\s+performance)?\b/i.test(lower)) return 'Live';
  if (/\bslowed\b/i.test(lower)) return 'Slowed';
  if (/\bsped\s*up\b/i.test(lower)) return 'Sped up';
  if (/\bpiano\b/i.test(lower)) return 'Piano';
  if (/\bmashup\b/i.test(lower)) return 'Mashup';
  if (/\bbolero\b/i.test(lower)) return 'Bolero';
  if (/\bmixtape\b/i.test(lower)) return 'Mixtape';
  if (/\bnightcore\b/i.test(lower)) return 'Nightcore';

  return 'Bản gốc';
}

/**
 * Strips YouTube channel noise like " - Topic", " Official", " VEVO"
 */
export function cleanChannelName(channel: string): string {
  if (!channel) return '';
  return channel
    .normalize('NFC')
    .replace(/\s*-\s*Topic\b/gi, '')
    .replace(/\s*(?:Official|VEVO|Channel|Offical)\b/gi, '')
    .trim();
}

/**
 * Capitalizes the first letter of each word properly in Vietnamese (toLocaleLowerCase('vi')).
 * Keeps common acronyms (DJ, MV, OST, EDM, VIP, etc.) intact.
 */
export function titleCaseVietnamese(str: string): string {
  if (!str) return '';

  return str
    .normalize('NFC')
    .split(' ')
    .map((word) => {
      if (!word) return '';

      // Check punctuation attached to word, e.g. "(Remix)" or "M-TP"
      const lower = word.toLowerCase();
      if (KNOWN_ACRONYMS[lower]) {
        return KNOWN_ACRONYMS[lower];
      }

      // Handle hyphenated names like M-TP or T-Pain
      if (word.includes('-')) {
        return word
          .split('-')
          .map((part) => {
            const pLower = part.toLowerCase();
            if (KNOWN_ACRONYMS[pLower]) return KNOWN_ACRONYMS[pLower];
            if (!part) return '';
            return part.charAt(0).toLocaleUpperCase('vi') + part.slice(1).toLocaleLowerCase('vi');
          })
          .join('-');
      }

      // Standard word
      return word.charAt(0).toLocaleUpperCase('vi') + word.slice(1).toLocaleLowerCase('vi');
    })
    .join(' ');
}

export interface ParsedTrackInfo {
  artist: string;
  track: string;
  genre: string;
  suggestedFilename: string;
}

export interface ParseOptions {
  autoCapitalize?: boolean;
  autoGenre?: boolean;
  defaultGenre?: string;
  extension?: string;
}

/**
 * Extracts Artist, Track, and Genre from YouTube title & metadata
 */
export function parseYouTubeMetadata(
  meta: {
    rawTitle: string;
    artist?: string;
    track?: string;
    uploader?: string;
    channel?: string;
  },
  options: ParseOptions = {}
): ParsedTrackInfo {
  const {
    autoCapitalize = true,
    autoGenre = true,
    defaultGenre = 'Bản gốc',
    extension = '.m4a',
  } = options;

  const rawTitle = meta.rawTitle || '';
  const cleanedTitle = cleanTitle(rawTitle);

  // 1. Detect genre from original raw title
  const detected = autoGenre ? detectGenre(rawTitle) : defaultGenre;
  const genre = detected || defaultGenre || 'Bản gốc';

  let rawArtist = '';
  let rawTrack = '';

  // 2. Priority A: Official artist and track metadata from YouTube
  if (meta.artist && meta.track) {
    rawArtist = meta.artist.trim();
    rawTrack = meta.track.trim();
  } else if (cleanedTitle.includes(' - ')) {
    // 3. Priority B: Split on " - "
    const parts = cleanedTitle.split(' - ');
    rawArtist = parts[0].trim();
    rawTrack = parts.slice(1).join(' - ').trim();
  } else if (cleanedTitle.includes(': ')) {
    // Priority C: Split on ": "
    const parts = cleanedTitle.split(': ');
    rawArtist = parts[0].trim();
    rawTrack = parts.slice(1).join(': ').trim();
  } else {
    // 4. Priority D: Fallback to channel/uploader as artist, cleanedTitle as track
    rawArtist = cleanChannelName(meta.channel || meta.uploader || 'YouTube');
    rawTrack = cleanedTitle;
  }

  // Remove genre from rawTrack if it was left like "(Remix)" at the end
  if (genre && genre !== 'Bản gốc') {
    const genreCleanRegex = new RegExp(`\\s*\\(?\\b${genre}\\b\\)?\\s*`, 'gi');
    rawTrack = rawTrack.replace(genreCleanRegex, ' ').replace(/\s+/g, ' ').trim();
  }

  // 5. Title-casing
  let artist = rawArtist;
  let track = rawTrack;

  if (autoCapitalize) {
    artist = titleCaseVietnamese(artist);
    track = titleCaseVietnamese(track);
  }

  // Final fallback
  if (!artist && !track) {
    track = cleanedTitle || 'Audio';
  }

  const suggestedFilename = buildFinalFilename(artist, track, genre, extension);

  return {
    artist,
    track,
    genre,
    suggestedFilename,
  };
}

/**
 * Builds final filename according to template:
 * - Bản gốc (no parentheses): "Tên Tác Giả - Tên Bài Hát.đuôi"
 * - Có thể loại: "Tên Tác Giả - Tên Bài Hát (Thể loại).đuôi"
 * - Sanitize forbidden filesystem chars (\ / : * ? " < > | \0)
 * - Max 120 chars, Unicode NFC
 */
export function buildFinalFilename(
  artist: string,
  track: string,
  genre: string,
  extension: string = '.m4a'
): string {
  const normExt = extension.startsWith('.') ? extension : `.${extension}`;
  let baseName = '';

  const cleanA = (artist || '').trim();
  const cleanT = (track || '').trim();
  const cleanG = (genre || '').trim();

  const isOriginal = !cleanG || cleanG.toLowerCase() === 'bản gốc';

  if (cleanA && cleanT) {
    baseName = isOriginal ? `${cleanA} - ${cleanT}` : `${cleanA} - ${cleanT} (${cleanG})`;
  } else if (cleanT) {
    baseName = isOriginal ? cleanT : `${cleanT} (${cleanG})`;
  } else if (cleanA) {
    baseName = isOriginal ? cleanA : `${cleanA} (${cleanG})`;
  } else {
    baseName = 'Audio';
  }

  // Sanitize forbidden filesystem characters: \ / : * ? " < > | \0
  let sanitized = baseName
    .normalize('NFC')
    .replace(/[/\\:*?"<>|\0]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/-+/g, '-')
    .trim();

  // Strip leading/trailing hyphens or dots
  sanitized = sanitized.replace(/^[.-]+|[.-]+$/g, '').trim();

  // Maximum 120 characters for baseName
  if (sanitized.length > 120) {
    sanitized = sanitized.slice(0, 120).trim();
  }

  if (!sanitized) sanitized = 'Audio';

  return `${sanitized}${normExt}`;
}
