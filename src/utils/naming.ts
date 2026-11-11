/**
 * Utility functions for smart YouTube metadata parsing,
 * title/artist extraction, Vietnamese title-casing, genre auto-detection,
 * machine learning heuristics (known authors, channel order),
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

export const KNOWN_ACRONYMS: Record<string, string> = {
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
  acv: 'ACV',
  'm-tp': 'M-TP',
  mtp: 'M-TP',
  vpop: 'V-Pop',
  'v-pop': 'V-Pop',
  remix: 'Remix',
  ft: 'ft.',
  'ft.': 'ft.',
  feat: 'feat.',
  'feat.': 'feat.',
  prod: 'Prod.',
  'prod.': 'Prod.',
};

/**
 * Built-in dictionary of well-known Vietnamese artists and producers
 */
export const PRESET_KNOWN_AUTHORS: string[] = [
  'Sơn Tùng M-TP',
  'Nguyễn Thạc Bảo Ngọc',
  'ACV',
  'Masew',
  'Đen Vâu',
  'Đen',
  'Jack - J97',
  'Jack',
  'K-ICM',
  'Hoàng Thùy Linh',
  'Hòa Minzy',
  'Vũ.',
  'Vũ',
  'Phan Mạnh Quỳnh',
  'Trung Quân',
  'B Ray',
  'Karik',
  'Suboi',
  'JustaTee',
  'Soobin',
  'Binz',
  'Rhymastic',
  'Touliver',
  'SlimV',
  'Triple D',
  'HIEUTHUHAI',
  'Double2T',
  'Anh Tú',
  'Đức Phúc',
  'Erik',
  'Văn Mai Hương',
  'Hồ Ngọc Hà',
  'Mỹ Tâm',
  'Hà Anh Tuấn',
  'Noo Phước Thịnh',
];

export interface LearnedData {
  knownAuthors: string[];
  channelOrder: Record<string, 'artist_first' | 'track_first'>;
}

/**
 * Normalizes string for loose comparison (removes accents, lowercase, strips non-alphanumeric)
 */
export function normalizeForCompare(str: string): string {
  if (!str) return '';
  return removeVietnameseTones(str)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Retrieves learned authors and channel ordering rules from localStorage
 */
export function getLearnedData(): LearnedData {
  if (typeof localStorage === 'undefined') {
    return { knownAuthors: [], channelOrder: {} };
  }
  try {
    const rawAuthors = localStorage.getItem('ag_known_authors');
    const rawOrder = localStorage.getItem('ag_channel_order');
    return {
      knownAuthors: rawAuthors ? JSON.parse(rawAuthors) : [],
      channelOrder: rawOrder ? JSON.parse(rawOrder) : {},
    };
  } catch {
    return { knownAuthors: [], channelOrder: {} };
  }
}

/**
 * Saves a recognized/downloaded author to localStorage dictionary
 */
export function saveLearnedAuthor(author: string): void {
  if (!author || typeof localStorage === 'undefined') return;
  const trimmed = author.trim();
  if (!trimmed || trimmed.toLowerCase() === 'youtube') return;

  const current = getLearnedData();
  const authorsSet = new Set(current.knownAuthors);
  authorsSet.add(trimmed);

  // If author string contains collaboration e.g. "A x B" or "A ft. B", also store sub-artists
  const subArtists = trimmed.split(/\s+(?:x|ft\.?|feat\.?|và|&)\s+|,/i);
  for (const part of subArtists) {
    const clean = part.trim();
    if (clean.length >= 2 && clean.toLowerCase() !== 'youtube') {
      authorsSet.add(clean);
    }
  }

  try {
    localStorage.setItem('ag_known_authors', JSON.stringify(Array.from(authorsSet)));
  } catch {}
}

/**
 * Saves learned preference for a specific YouTube channel
 */
export function saveChannelOrder(
  channel: string,
  order: 'artist_first' | 'track_first'
): void {
  if (!channel || typeof localStorage === 'undefined') return;
  const channelKey = normalizeForCompare(cleanChannelName(channel));
  if (!channelKey) return;

  const current = getLearnedData();
  current.channelOrder[channelKey] = order;

  try {
    localStorage.setItem('ag_channel_order', JSON.stringify(current.channelOrder));
  } catch {}
}

/**
 * Clears all learned author and channel order data
 */
export function clearLearnedData(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem('ag_known_authors');
    localStorage.removeItem('ag_channel_order');
  } catch {}
}

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
 * Strips YouTube clutter phrases (Official Music Video, Lyrics, 4K, etc.)
 * while preserving ft./feat. collaborations.
 */
export function cleanClutterPhrases(text: string): string {
  if (!text) return '';
  let cleaned = text;

  const clutterRegexes = [
    /\((?:official\s+)?(?:music\s+video|mv|audio|lyrics?|lyric\s+video|visualizer|live\s+performance|video\s+clip|video|clip|bản\s+chuẩn)\)/gi,
    /\[(?:official\s+)?(?:music\s+video|mv|audio|lyrics?|lyric\s+video|visualizer|live\s+performance|video\s+clip|video|clip|bản\s+chuẩn)\]/gi,
    /【(?:official\s+)?(?:music\s+video|mv|audio|lyrics?|lyric\s+video|visualizer|live\s+performance|video\s+clip|video|clip)】/gi,
    /\b(?:official\s+music\s+video|official\s+audio|official\s+mv|lyric\s+video|official\s+video)\b/gi,
    /\b(?:4k|hd|full\s*hd|1080p|720p|full)\b/gi,
  ];

  for (const regex of clutterRegexes) {
    cleaned = cleaned.replace(regex, ' ');
  }

  // Remove empty brackets left behind
  cleaned = cleaned.replace(/\(\s*\)/g, ' ').replace(/\[\s*\]/g, ' ');

  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  return cleaned;
}

/**
 * General title cleaning wrapper
 */
export function cleanTitle(rawTitle: string): string {
  if (!rawTitle) return '';
  let cleaned = rawTitle.normalize('NFC');

  // Remove musical symbols, special chars and emojis
  cleaned = cleaned.replace(/[♪♫🎵🎶★☆▶►▲▼●◆■♦◄•~～_]+/g, ' ');
  cleaned = cleaned.replace(
    /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}]/gu,
    ' '
  );

  cleaned = cleanClutterPhrases(cleaned);
  cleaned = cleaned.replace(/^[ -]+|[ -]+$/g, '').trim();
  return cleaned || rawTitle;
}

/**
 * Automatically detects music genre from keywords in the title or tag.
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
 * Extracts and strips genre keywords from a segment when it stands alone,
 * in parentheses/brackets (e.g. "(Lofi Ver.)"), or at the end of the artist (e.g. "ACV Drill" -> "ACV").
 * Ensures we do not strip if it would leave the string empty.
 */
export function extractAndStripGenre(
  text: string,
  currentGenre: string = 'Bản gốc'
): { cleanedText: string; detectedGenre: string } {
  if (!text) return { cleanedText: '', detectedGenre: currentGenre };

  let detected = currentGenre;
  let cleaned = text.trim();

  // 1. Check parenthesized/bracketed genre tag e.g. "(Lofi Ver.)", "[Remix]", "(Drill)"
  const bracketGenreMatch = cleaned.match(
    /[(\[]\s*([^()[\]]*?(?:drill|lo-?fi|lofi|remix|acoustic|cover|live|slowed|sped\s*up|piano|mashup|bolero|mixtape|nightcore)[^()[\]]*?)\s*[)\]]/i
  );
  if (bracketGenreMatch) {
    const inside = bracketGenreMatch[1];
    const g = detectGenre(inside);
    if (g !== 'Bản gốc') {
      detected = g;
      const stripped = cleaned.replace(bracketGenreMatch[0], ' ').replace(/\s+/g, ' ').trim();
      if (stripped.length > 0) {
        cleaned = stripped;
      }
    }
  }

  // 2. Check genre at the very end of the string e.g. "ACV Drill" -> "ACV" + Drill
  const endGenreRegex = /\s+(drill|lo-?fi|remix|acoustic|cover|live|slowed|sped\s*up|piano|mashup|bolero|mixtape|nightcore)$/i;
  const endMatch = cleaned.match(endGenreRegex);
  if (endMatch) {
    const g = detectGenre(endMatch[1]);
    if (g !== 'Bản gốc') {
      detected = g;
      const stripped = cleaned.slice(0, endMatch.index).trim();
      if (stripped.length > 0) {
        cleaned = stripped;
      }
    }
  }

  return { cleanedText: cleaned, detectedGenre: detected };
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
    .replace(/^[ -]+|[ -]+$/g, '')
    .trim();
}

/**
 * Capitalizes the first letter of each word properly in Vietnamese (toLocaleLowerCase('vi')).
 * If the whole string is uppercase (e.g. "CHẠY NGAY ĐI"), converts it to Title Case.
 * Keeps acronyms (DJ, MV, OST, EDM, VIP, etc.) and known entities (M-TP, ACV) intact.
 */
export function titleCaseVietnamese(str: string): string {
  if (!str) return '';

  const trimmed = str.trim().normalize('NFC');
  const words = trimmed.split(' ');

  return words
    .map((word) => {
      if (!word) return '';

      const lower = word.toLowerCase();

      // Check lowercase conjunctions in collaborations
      if (lower === 'x') return 'x';
      if (lower === 'vs') return 'vs';
      if (lower === 'ft' || lower === 'ft.') return 'ft.';
      if (lower === 'feat' || lower === 'feat.') return 'feat.';

      // Check exact acronym matches
      if (KNOWN_ACRONYMS[lower]) {
        return KNOWN_ACRONYMS[lower];
      }

      // Check hyphenated names like M-TP or T-Pain
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
  isLowConfidence: boolean;
  suggestedFilename: string;
}

export interface ParseOptions {
  autoCapitalize?: boolean;
  autoGenre?: boolean;
  defaultGenre?: string;
  extension?: string;
  knownAuthors?: string[];
  channelOrder?: Record<string, 'artist_first' | 'track_first'>;
}

/**
 * Checks whether a string matches any author in the dictionary
 */
function matchesAnyAuthor(part: string, authors: string[]): boolean {
  if (!part) return false;
  const normPart = normalizeForCompare(part);
  if (!normPart) return false;

  for (const author of authors) {
    const normAuth = normalizeForCompare(author);
    if (!normAuth) continue;
    if (normPart === normAuth) return true;
    if (normPart.includes(normAuth) && normAuth.length >= 3) return true;
  }
  return false;
}

/**
 * Checks if a segment is purely clutter (OFFICIAL MUSIC VIDEO, Lyrics, etc.)
 */
function isClutterSegment(seg: string): boolean {
  const cleaned = cleanClutterPhrases(seg);
  return !cleaned || cleaned.length === 0;
}

/**
 * Extracts Artist, Track, Genre, and Confidence level from YouTube title & metadata
 * according to rigorous pedagogical/CV-7991-style rules.
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
    knownAuthors: customKnownAuthors,
    channelOrder: customChannelOrder,
  } = options;

  const rawTitle = (meta.rawTitle || '').trim();

  // Guard: if empty or raw temporary placeholder "YouTube <videoId>", return blank
  if (!rawTitle || /^YouTube\s+[a-zA-Z0-9_-]{11}$/i.test(rawTitle)) {
    return {
      artist: '',
      track: '',
      genre: defaultGenre,
      isLowConfidence: false,
      suggestedFilename: `Audio${extension.startsWith('.') ? extension : `.${extension}`}`,
    };
  }

  // Fetch learned data
  const learned = getLearnedData();
  const knownAuthors = [
    ...PRESET_KNOWN_AUTHORS,
    ...(customKnownAuthors || learned.knownAuthors),
  ];
  const channelOrder = customChannelOrder || learned.channelOrder;

  const channelRaw = meta.channel || meta.uploader || '';
  const channelClean = cleanChannelName(channelRaw);

  let currentGenre = defaultGenre;
  let isLowConfidence = false;

  // Step 1: Unicode NFC & replace musical notes, symbols, emojis with spaces
  let text = rawTitle.normalize('NFC');
  text = text.replace(/[♪♫🎵🎶★☆▶►▲▼●◆■♦◄•~～_]+/g, ' ');
  text = text.replace(
    /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{FE00}-\u{FE0F}]/gu,
    ' '
  );

  // Step 2: Extract leading tag e.g. [DRILL] or (Lofi)
  const leadingTagMatch = text.match(/^\s*(\[|\()([a-zA-Z0-9\s\-_]+)(\]|\))\s*/);
  if (leadingTagMatch) {
    const inside = leadingTagMatch[2].trim();
    const g = detectGenre(inside);
    if (g !== 'Bản gốc') {
      currentGenre = g;
      text = text.slice(leadingTagMatch[0].length).trim();
    }
  }

  // Step 3: Delimiter "|"
  let partA = '';
  let partB = '';
  let hasTwoParts = false;

  if (text.includes('|')) {
    const segments = text.split('|').map((s) => s.trim()).filter(Boolean);
    // If segment 0 already contains " - " or long dash with spaces
    if (/\s+[–—\-]\s+/.test(segments[0])) {
      // Use only segment 0, drop subtitle / tagline after |
      text = segments[0];
    } else {
      // Filter out clutter segments
      const validSegs = segments.filter((seg) => !isClutterSegment(seg));
      if (validSegs.length >= 2) {
        partA = validSegs[0];
        partB = validSegs[1];
        hasTwoParts = true;
      } else if (validSegs.length === 1) {
        text = validSegs[0];
      }
    }
  }

  // Step 4: Long dash " – " / " — " with spaces converted to " - "
  if (!hasTwoParts) {
    text = text.replace(/\s+[–—]\s+/g, ' - ');
    if (text.includes(' - ')) {
      const dashParts = text.split(/\s+-\s+/);
      partA = dashParts[0].trim();
      partB = dashParts.slice(1).join(' - ').trim();
      hasTwoParts = true;
    }
  }

  // Step 5: Clean clutter phrases from parts or text
  if (hasTwoParts) {
    partA = cleanClutterPhrases(partA);
    partB = cleanClutterPhrases(partB);
  } else {
    text = cleanClutterPhrases(text);
  }

  // Step 6: Genre detection and stripping
  if (autoGenre && currentGenre === 'Bản gốc') {
    const g = detectGenre(rawTitle);
    if (g !== 'Bản gốc') {
      currentGenre = g;
    }
  }

  if (hasTwoParts) {
    const stripA = extractAndStripGenre(partA, currentGenre);
    partA = stripA.cleanedText;
    if (stripA.detectedGenre !== 'Bản gốc') currentGenre = stripA.detectedGenre;

    const stripB = extractAndStripGenre(partB, currentGenre);
    partB = stripB.cleanedText;
    if (stripB.detectedGenre !== 'Bản gốc') currentGenre = stripB.detectedGenre;
  }

  let finalArtist = '';
  let finalTrack = '';

  // Determine Artist and Track
  if (meta.artist && meta.track && meta.artist.trim() && meta.track.trim()) {
    // Priority a: yt-dlp official artist and track metadata
    finalArtist = meta.artist.trim();
    finalTrack = meta.track.trim();
  } else if (hasTwoParts && partA && partB) {
    const normA = normalizeForCompare(partA);
    const normB = normalizeForCompare(partB);
    const normChannel = normalizeForCompare(channelClean);

    // b) Channel match
    const aMatchesChannel =
      Boolean(normChannel) &&
      (normA === normChannel || normChannel.includes(normA) || normA.includes(normChannel));
    const bMatchesChannel =
      Boolean(normChannel) &&
      (normB === normChannel || normChannel.includes(normB) || normB.includes(normChannel));

    // c) Known authors dictionary match
    const aMatchesKnown = matchesAnyAuthor(partA, knownAuthors);
    const bMatchesKnown = matchesAnyAuthor(partB, knownAuthors);

    // d) Learned channel order
    const channelKey = normChannel;
    const learnedOrder = channelKey ? channelOrder[channelKey] : undefined;

    // e) Collaboration keywords
    const hasCollab = (s: string) => /\b(?:x|ft\.?|feat\.?|và|&)\b|,/i.test(s);
    const aHasCollab = hasCollab(partA);
    const bHasCollab = hasCollab(partB);

    if (aMatchesChannel && !bMatchesChannel) {
      finalArtist = partA;
      finalTrack = partB;
      isLowConfidence = false;
    } else if (bMatchesChannel && !aMatchesChannel) {
      finalArtist = partB;
      finalTrack = partA;
      isLowConfidence = false;
    } else if (aMatchesKnown && !bMatchesKnown) {
      finalArtist = partA;
      finalTrack = partB;
      isLowConfidence = false;
    } else if (bMatchesKnown && !aMatchesKnown) {
      finalArtist = partB;
      finalTrack = partA;
      isLowConfidence = false;
    } else if (learnedOrder === 'artist_first') {
      finalArtist = partA;
      finalTrack = partB;
      isLowConfidence = false;
    } else if (learnedOrder === 'track_first') {
      finalArtist = partB;
      finalTrack = partA;
      isLowConfidence = false;
    } else if (aHasCollab && !bHasCollab) {
      finalArtist = partA;
      finalTrack = partB;
      isLowConfidence = false;
    } else if (bHasCollab && !aHasCollab) {
      finalArtist = partB;
      finalTrack = partA;
      isLowConfidence = false;
    } else {
      // f) Default: Part A is Artist, Part B is Track -> LOW CONFIDENCE!
      finalArtist = partA;
      finalTrack = partB;
      isLowConfidence = true;
    }
  } else {
    // Single part: artist = channelClean, track = text -> LOW CONFIDENCE!
    finalArtist = channelClean || 'YouTube';
    finalTrack = text || rawTitle;
    isLowConfidence = true;
  }

  // Step 7: Title-casing
  if (autoCapitalize) {
    finalArtist = titleCaseVietnamese(finalArtist);
    finalTrack = titleCaseVietnamese(finalTrack);
  }

  const suggestedFilename = buildFinalFilename(
    finalArtist,
    finalTrack,
    currentGenre,
    extension
  );

  return {
    artist: finalArtist,
    track: finalTrack,
    genre: currentGenre,
    isLowConfidence,
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
