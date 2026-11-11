import test from 'node:test';
import assert from 'node:assert/strict';
import { parseYouTubeLink, parseMultipleLinks, sanitizeFilename } from './youtube';

test('parses standard youtube.com watch URL', () => {
  const result = parseYouTubeLink('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  assert.equal(result.isValid, true);
  assert.equal(result.videoId, 'dQw4w9WgXcQ');
});

test('parses youtu.be short URL with tracking query params', () => {
  const result = parseYouTubeLink('https://youtu.be/dQw4w9WgXcQ?si=abcdef123456');
  assert.equal(result.isValid, true);
  assert.equal(result.videoId, 'dQw4w9WgXcQ');
});

test('parses mobile and music youtube links', () => {
  const mobile = parseYouTubeLink('https://m.youtube.com/watch?v=dQw4w9WgXcQ&feature=share');
  assert.equal(mobile.isValid, true);
  assert.equal(mobile.videoId, 'dQw4w9WgXcQ');

  const music = parseYouTubeLink('https://music.youtube.com/watch?v=dQw4w9WgXcQ');
  assert.equal(music.isValid, true);
  assert.equal(music.videoId, 'dQw4w9WgXcQ');
});

test('parses shorts URL', () => {
  const shorts = parseYouTubeLink('https://www.youtube.com/shorts/dQw4w9WgXcQ');
  assert.equal(shorts.isValid, true);
  assert.equal(shorts.videoId, 'dQw4w9WgXcQ');
});

test('parses raw 11-char video ID', () => {
  const raw = parseYouTubeLink('dQw4w9WgXcQ');
  assert.equal(raw.isValid, true);
  assert.equal(raw.videoId, 'dQw4w9WgXcQ');
});

test('returns error for invalid URLs', () => {
  const invalid = parseYouTubeLink('https://example.com/not-a-video');
  assert.equal(invalid.isValid, false);
  assert.equal(invalid.videoId, null);
  assert.ok(invalid.errorMessage?.includes('không hợp lệ'));

  const empty = parseYouTubeLink('   ');
  assert.equal(empty.isValid, false);
});

test('parses multiple links correctly', () => {
  const input = `
    https://www.youtube.com/watch?v=dQw4w9WgXcQ
    invalid-link
    https://youtu.be/dQw4w9WgXcQ
  `;
  const results = parseMultipleLinks(input);
  assert.equal(results.length, 3);
  assert.equal(results[0].isValid, true);
  assert.equal(results[0].videoId, 'dQw4w9WgXcQ');
  assert.equal(results[1].isValid, false);
  assert.equal(results[2].isValid, true);
});

test('sanitizes filename preserving Vietnamese diacritics', () => {
  const raw = 'Bài Hát Tuyệt Vời: Yêu & Thương / 2026? <Bản Mới>';
  const cleaned = sanitizeFilename(raw);
  assert.equal(cleaned.includes(':'), false);
  assert.equal(cleaned.includes('/'), false);
  assert.equal(cleaned.includes('?'), false);
  assert.equal(cleaned.includes('<'), false);
  assert.equal(cleaned.includes('>'), false);
  assert.ok(cleaned.includes('Bài Hát Tuyệt Vời'));
});
