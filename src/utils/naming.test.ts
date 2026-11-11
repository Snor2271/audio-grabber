import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cleanTitle,
  detectGenre,
  cleanChannelName,
  titleCaseVietnamese,
  removeVietnameseTones,
  buildFinalFilename,
  parseYouTubeMetadata,
} from './naming';

test('removes YouTube clutter phrases from title', () => {
  const input = 'Sơn Tùng M-TP - Đừng Làm Trái Tim Anh Đau (Official Music Video) [4K]';
  const cleaned = cleanTitle(input);
  assert.equal(cleaned, 'Sơn Tùng M-TP - Đừng Làm Trái Tim Anh Đau');
});

test('preserves ft. and feat. collaborations', () => {
  const input = 'Double2T ft. Masew - À Lôi [Lyric Video]';
  const cleaned = cleanTitle(input);
  assert.ok(cleaned.includes('ft. Masew'));
  assert.equal(cleaned.includes('[Lyric Video]'), false);
});

test('detects genres correctly', () => {
  assert.equal(detectGenre('Thành Đô Drill - GUrbane'), 'Drill');
  assert.equal(detectGenre('Em Của Ngày Hôm Qua (Remix)'), 'Remix');
  assert.equal(detectGenre('Có Chàng Trai Viết Lên Cây (Lofi Chill)'), 'Lofi');
  assert.equal(detectGenre('Nàng Thơ (Piano Cover)'), 'Cover');
  assert.equal(detectGenre('Chuyện Hoa Sim (Bolero Tuyển Chọn)'), 'Bolero');
  assert.equal(detectGenre('Bài Hát Gốc Không Có Thể Loại'), 'Bản gốc');
});

test('cleans channel name suffixes', () => {
  assert.equal(cleanChannelName('Sơn Tùng M-TP Official'), 'Sơn Tùng M-TP');
  assert.equal(cleanChannelName('Taylor Swift - Topic'), 'Taylor Swift');
  assert.equal(cleanChannelName('Vũ VEVO'), 'Vũ');
});

test('titleCaseVietnamese preserves uppercase acronyms like DJ, MV, EDM', () => {
  const res = titleCaseVietnamese('dj masew và mv hot edm');
  assert.ok(res.includes('DJ'));
  assert.ok(res.includes('MV'));
  assert.ok(res.includes('EDM'));
  assert.ok(res.includes('Masew'));
});

test('removeVietnameseTones outputs clean ASCII string', () => {
  const res = removeVietnameseTones('Nguyễn Thúc Thùy Tiên - Đẹp Từng Centimet');
  assert.equal(res, 'Nguyen Thuc Thuy Tien - Dep Tung Centimet');
});

test('buildFinalFilename handles Bản gốc without parentheses', () => {
  const file = buildFinalFilename('Sơn Tùng M-TP', 'Nắng Ấm Xa Dần', 'Bản gốc', '.m4a');
  assert.equal(file, 'Sơn Tùng M-TP - Nắng Ấm Xa Dần.m4a');
});

test('buildFinalFilename handles custom genre with parentheses', () => {
  const file = buildFinalFilename('Sơn Tùng M-TP', 'Nắng Ấm Xa Dần', 'Drill', '.m4a');
  assert.equal(file, 'Sơn Tùng M-TP - Nắng Ấm Xa Dần (Drill).m4a');
});

test('parseYouTubeMetadata extracts artist and track cleanly from title', () => {
  const parsed = parseYouTubeMetadata({
    rawTitle: 'Tạ Tình - My Cưng Tạ - Việt (Official Music Video)',
    uploader: 'My Cưng Tạ',
  });
  assert.equal(parsed.artist, 'Tạ Tình');
  assert.equal(parsed.genre, 'Bản gốc');
  assert.ok(parsed.suggestedFilename.includes('Tạ Tình'));
});
