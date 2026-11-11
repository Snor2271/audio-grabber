import test from 'node:test';
import assert from 'node:assert/strict';
import { parseYouTubeLink, parseMultipleLinks, sanitizeFilename } from './youtube';
import {
  parseYouTubeMetadata,
  normalizeForCompare,
  cleanChannelName,
} from './naming';

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

// ==========================================
// BỘ KIỂM THỬ TỰ NHẬN DIỆN TÊN CHUẨN (User Requirements)
// ==========================================

test('Test 1: [DRILL] Ngày Mình Chia Tay - Nguyễn Thạc Bảo Ngọc x ACV Drill | Xin Mưa Ngừng Rơi Cho Vơi Nỗi Buồn', () => {
  const title =
    '[DRILL] Ngày Mình Chia Tay - Nguyễn Thạc Bảo Ngọc x ACV Drill | Xin Mưa Ngừng Rơi Cho Vơi Nỗi Buồn';
  const parsed = parseYouTubeMetadata({
    rawTitle: title,
    channel: 'ACV Music',
  });

  assert.equal(parsed.artist, 'Nguyễn Thạc Bảo Ngọc x ACV');
  assert.equal(parsed.track, 'Ngày Mình Chia Tay');
  assert.equal(parsed.genre, 'Drill');
  assert.equal(
    parsed.suggestedFilename,
    'Nguyễn Thạc Bảo Ngọc x ACV - Ngày Mình Chia Tay (Drill).m4a'
  );
});

test('Test 2: Sơn Tùng M-TP | CHẠY NGAY ĐI | OFFICIAL MUSIC VIDEO (kênh Sơn Tùng M-TP Official)', () => {
  const title = 'Sơn Tùng M-TP | CHẠY NGAY ĐI | OFFICIAL MUSIC VIDEO';
  const parsed = parseYouTubeMetadata({
    rawTitle: title,
    channel: 'Sơn Tùng M-TP Official',
  });

  assert.equal(parsed.artist, 'Sơn Tùng M-TP');
  assert.equal(parsed.track, 'Chạy Ngay Đi');
  assert.equal(parsed.genre, 'Bản gốc');
  assert.equal(parsed.suggestedFilename, 'Sơn Tùng M-TP - Chạy Ngay Đi.m4a');
});

test('Test 3: Tên Ca Sĩ - Tên Bài (Official MV) (kênh Tên Ca Sĩ Official)', () => {
  const title = 'Tên Ca Sĩ - Tên Bài (Official MV)';
  const parsed = parseYouTubeMetadata({
    rawTitle: title,
    channel: 'Tên Ca Sĩ Official',
  });

  assert.equal(parsed.artist, 'Tên Ca Sĩ');
  assert.equal(parsed.track, 'Tên Bài');
  assert.equal(parsed.genre, 'Bản gốc');
  assert.equal(parsed.suggestedFilename, 'Tên Ca Sĩ - Tên Bài.m4a');
});

test('Test 4: Tên Bài (Lofi Ver.) - Tên Ca Sĩ (kênh Nhạc Chill chưa học -> độ tin cậy thấp; sau khi học -> đúng)', () => {
  const title = 'Tên Bài (Lofi Ver.) - Tên Ca Sĩ';
  const channel = 'Nhạc Chill';

  // Lần 1: Chưa có dữ liệu học -> độ tin cậy thấp, mặc định Tác giả - Bài hát
  const parsedBefore = parseYouTubeMetadata({
    rawTitle: title,
    channel: channel,
  });
  assert.equal(parsedBefore.isLowConfidence, true);
  assert.equal(parsedBefore.genre, 'Lofi');

  // Người dùng đổi chỗ hoặc tải -> lưu quy luật kênh này là "bài hát trước" (track_first)
  const channelKey = normalizeForCompare(cleanChannelName(channel));
  const channelOrder: Record<string, 'artist_first' | 'track_first'> = {
    [channelKey]: 'track_first',
  };

  // Lần 2: Chạy với quy luật đã học của kênh
  const parsedAfter = parseYouTubeMetadata(
    {
      rawTitle: title,
      channel: channel,
    },
    { channelOrder }
  );

  assert.equal(parsedAfter.artist, 'Tên Ca Sĩ');
  assert.equal(parsedAfter.track, 'Tên Bài');
  assert.equal(parsedAfter.genre, 'Lofi');
  assert.equal(parsedAfter.isLowConfidence, false);
  assert.equal(parsedAfter.suggestedFilename, 'Tên Ca Sĩ - Tên Bài (Lofi).m4a');
});
