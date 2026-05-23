import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseVideoUrl, buildEmbedSrc } from '../src/index.js';

// ── parseVideoUrl ───────────────────────────

describe('parseVideoUrl — YouTube', () => {
  it('youtu.be short URL', () => {
    const r = parseVideoUrl({ url: 'https://youtu.be/dQw4w9WgXcQ' });
    assert.deepEqual(r, { provider: 'youtube', id: 'dQw4w9WgXcQ', aspectRatio: '16/9' });
  });
  it('youtube.com/watch?v=', () => {
    const r = parseVideoUrl({ url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' });
    assert.equal(r.provider, 'youtube');
    assert.equal(r.id, 'dQw4w9WgXcQ');
  });
  it('youtube.com/embed/', () => {
    const r = parseVideoUrl({ url: 'https://youtube.com/embed/dQw4w9WgXcQ' });
    assert.equal(r.id, 'dQw4w9WgXcQ');
  });
  it('youtube.com/shorts/', () => {
    const r = parseVideoUrl({ url: 'https://youtube.com/shorts/dQw4w9WgXcQ' });
    assert.equal(r.id, 'dQw4w9WgXcQ');
  });
});

describe('parseVideoUrl — Vimeo', () => {
  it('vimeo.com/ID', () => {
    const r = parseVideoUrl({ url: 'https://vimeo.com/123456789' });
    assert.deepEqual(r, { provider: 'vimeo', id: '123456789', aspectRatio: '16/9' });
  });
  it('vimeo.com/video/ID', () => {
    const r = parseVideoUrl({ url: 'https://vimeo.com/video/123456789' });
    assert.equal(r.id, '123456789');
  });
});

describe('parseVideoUrl — TikTok / Instagram', () => {
  it('TikTok user video URL', () => {
    const r = parseVideoUrl({ url: 'https://www.tiktok.com/@user/video/7234567890' });
    assert.deepEqual(r, { provider: 'tiktok', id: '7234567890', aspectRatio: '9/16' });
  });
  it('TikTok embed URL', () => {
    const r = parseVideoUrl({ url: 'https://www.tiktok.com/embed/v2/7234567890' });
    assert.equal(r.id, '7234567890');
  });
  it('Instagram post', () => {
    const r = parseVideoUrl({ url: 'https://www.instagram.com/p/ABC123/' });
    assert.deepEqual(r, { provider: 'instagram', id: 'ABC123', kind: 'post', aspectRatio: '1/1' });
  });
  it('Instagram reel — 9:16 aspect', () => {
    const r = parseVideoUrl({ url: 'https://www.instagram.com/reel/ABC123/' });
    assert.equal(r.kind, 'reel');
    assert.equal(r.aspectRatio, '9/16');
  });
  it('Instagram IGTV', () => {
    const r = parseVideoUrl({ url: 'https://www.instagram.com/tv/ABC123/' });
    assert.equal(r.kind, 'tv');
  });
});

describe('parseVideoUrl — SoundCloud / Spotify', () => {
  it('SoundCloud track', () => {
    const r = parseVideoUrl({ url: 'https://soundcloud.com/user/track-name' });
    assert.equal(r.provider, 'soundcloud');
    assert.equal(r.kind, 'track');
    assert.equal(r.id, 'https://soundcloud.com/user/track-name');
  });
  it('SoundCloud playlist (sets)', () => {
    const r = parseVideoUrl({ url: 'https://soundcloud.com/user/sets/my-playlist' });
    assert.equal(r.kind, 'playlist');
  });
  it('Spotify track', () => {
    const r = parseVideoUrl({ url: 'https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh' });
    assert.deepEqual(r, {
      provider: 'spotify',
      id: '4iV5W9uYEdYUVa79Axb7Rh',
      kind: 'track',
      aspectRatio: '1/1',
    });
  });
  it('Spotify episode', () => {
    const r = parseVideoUrl({ url: 'https://open.spotify.com/episode/EP123' });
    assert.equal(r.kind, 'episode');
  });
});

describe('parseVideoUrl — Twitch', () => {
  it('Twitch VOD', () => {
    const r = parseVideoUrl({ url: 'https://www.twitch.tv/videos/123456789' });
    assert.deepEqual(r, { provider: 'twitch', id: '123456789', kind: 'video', aspectRatio: '16/9' });
  });
  it('Twitch clip (clips.twitch.tv)', () => {
    const r = parseVideoUrl({ url: 'https://clips.twitch.tv/MyAwesomeClip-xyz' });
    assert.equal(r.kind, 'clip');
    assert.equal(r.id, 'MyAwesomeClip-xyz');
  });
  it('Twitch clip (user/clip/slug)', () => {
    const r = parseVideoUrl({ url: 'https://www.twitch.tv/user/clip/MyAwesomeClip-xyz' });
    assert.equal(r.kind, 'clip');
  });
});

describe('parseVideoUrl — Loom / Wistia / Streamable', () => {
  it('Loom share URL', () => {
    const r = parseVideoUrl({ url: 'https://www.loom.com/share/abc123' });
    assert.deepEqual(r, { provider: 'loom', id: 'abc123', aspectRatio: '16/9' });
  });
  it('Wistia medias URL', () => {
    const r = parseVideoUrl({ url: 'https://acme.wistia.com/medias/xyz123' });
    assert.equal(r.provider, 'wistia');
    assert.equal(r.id, 'xyz123');
  });
  it('Streamable short URL', () => {
    const r = parseVideoUrl({ url: 'https://streamable.com/abc123' });
    assert.deepEqual(r, { provider: 'streamable', id: 'abc123', aspectRatio: '16/9' });
  });
  it('Streamable /e/ URL', () => {
    const r = parseVideoUrl({ url: 'https://streamable.com/e/abc123' });
    assert.equal(r.id, 'abc123');
  });
});

describe('parseVideoUrl — bare ID + provider', () => {
  it('YouTube via { id, provider }', () => {
    const r = parseVideoUrl({ id: 'dQw4w9WgXcQ', provider: 'youtube' });
    assert.deepEqual(r, { provider: 'youtube', id: 'dQw4w9WgXcQ', aspectRatio: '16/9' });
  });
  it('TikTok via { id, provider } gets 9:16', () => {
    const r = parseVideoUrl({ id: '7234567890', provider: 'tiktok' });
    assert.equal(r.aspectRatio, '9/16');
  });
  it('Instagram via { id, provider } gets 1:1 by default', () => {
    const r = parseVideoUrl({ id: 'ABC', provider: 'instagram' });
    assert.equal(r.aspectRatio, '1/1');
  });
});

describe('parseVideoUrl — failure cases', () => {
  it('returns null for empty input', () => {
    assert.equal(parseVideoUrl({}), null);
    assert.equal(parseVideoUrl(null), null);
    assert.equal(parseVideoUrl(undefined), null);
  });
  it('returns null for unknown URL', () => {
    assert.equal(parseVideoUrl({ url: 'https://example.com/foo' }), null);
  });
  it('returns null when only id is set (no provider)', () => {
    assert.equal(parseVideoUrl({ id: 'abc' }), null);
  });
});

// ── buildEmbedSrc ───────────────────────────

describe('buildEmbedSrc — YouTube', () => {
  it('basic — nocookie host + rel=0', () => {
    const src = buildEmbedSrc({ provider: 'youtube', id: 'abc12345678', aspectRatio: '16/9' });
    assert.ok(src.startsWith('https://www.youtube-nocookie.com/embed/abc12345678?'));
    assert.ok(src.includes('rel=0'));
  });
  it('autoplay + mute', () => {
    const src = buildEmbedSrc(
      { provider: 'youtube', id: 'abc', aspectRatio: '16/9' },
      { autoplay: true, mute: true },
    );
    assert.ok(src.includes('autoplay=1'));
    assert.ok(src.includes('mute=1'));
  });
  it('loop adds playlist=ID', () => {
    const src = buildEmbedSrc(
      { provider: 'youtube', id: 'abc', aspectRatio: '16/9' },
      { loop: true },
    );
    assert.ok(src.includes('loop=1'));
    assert.ok(src.includes('playlist=abc'));
  });
  it('rel:true removes rel=0', () => {
    const src = buildEmbedSrc(
      { provider: 'youtube', id: 'abc', aspectRatio: '16/9' },
      { rel: true },
    );
    assert.ok(!src.includes('rel=0'));
  });
});

describe('buildEmbedSrc — Vimeo', () => {
  it('always carries dnt=1', () => {
    const src = buildEmbedSrc({ provider: 'vimeo', id: '123', aspectRatio: '16/9' });
    assert.ok(src.includes('dnt=1'));
  });
  it('autoplay + muted', () => {
    const src = buildEmbedSrc(
      { provider: 'vimeo', id: '123', aspectRatio: '16/9' },
      { autoplay: true, mute: true, loop: true },
    );
    assert.ok(src.includes('autoplay=1'));
    assert.ok(src.includes('muted=1'));
    assert.ok(src.includes('loop=1'));
  });
});

describe('buildEmbedSrc — other providers', () => {
  it('TikTok autoplay query', () => {
    const src = buildEmbedSrc(
      { provider: 'tiktok', id: '7234567890', aspectRatio: '9/16' },
      { autoplay: true },
    );
    assert.equal(src, 'https://www.tiktok.com/embed/v2/7234567890?autoplay=1');
  });
  it('Instagram reel uses /reel/ kindPath', () => {
    const src = buildEmbedSrc({ provider: 'instagram', id: 'ABC', kind: 'reel', aspectRatio: '9/16' });
    assert.equal(src, 'https://www.instagram.com/reel/ABC/embed/');
  });
  it('SoundCloud carries url query param', () => {
    const src = buildEmbedSrc({
      provider: 'soundcloud',
      id: 'https://soundcloud.com/user/track',
      aspectRatio: '1/1',
    });
    assert.ok(src.includes('url=https%3A%2F%2Fsoundcloud.com%2Fuser%2Ftrack'));
  });
  it('Spotify embed uses kind path', () => {
    const src = buildEmbedSrc({
      provider: 'spotify',
      id: '4iV5W9uYEdYUVa79Axb7Rh',
      kind: 'track',
      aspectRatio: '1/1',
    });
    assert.equal(src, 'https://open.spotify.com/embed/track/4iV5W9uYEdYUVa79Axb7Rh');
  });
  it('Twitch clip URL', () => {
    const src = buildEmbedSrc(
      { provider: 'twitch', id: 'MyClip', kind: 'clip', aspectRatio: '16/9' },
      { parent: 'example.com' },
    );
    assert.ok(src.startsWith('https://clips.twitch.tv/embed?'));
    assert.ok(src.includes('clip=MyClip'));
    assert.ok(src.includes('parent=example.com'));
  });
  it('Twitch VOD prefixes v before the id', () => {
    const src = buildEmbedSrc(
      { provider: 'twitch', id: '123', kind: 'video', aspectRatio: '16/9' },
      { parent: 'example.com' },
    );
    assert.ok(src.includes('video=v123'));
  });
  it('Loom embed URL', () => {
    const src = buildEmbedSrc({ provider: 'loom', id: 'abc', aspectRatio: '16/9' });
    assert.equal(src, 'https://www.loom.com/embed/abc');
  });
  it('Loom embed URL with autoplay', () => {
    const src = buildEmbedSrc({ provider: 'loom', id: 'abc', aspectRatio: '16/9' }, { autoplay: true });
    assert.equal(src, 'https://www.loom.com/embed/abc?autoplay=1');
  });
  it('Wistia embed URL', () => {
    const src = buildEmbedSrc({ provider: 'wistia', id: 'xyz', aspectRatio: '16/9' });
    assert.equal(src, 'https://fast.wistia.net/embed/iframe/xyz');
  });
  it('Streamable bare', () => {
    const src = buildEmbedSrc({ provider: 'streamable', id: 'abc', aspectRatio: '16/9' });
    assert.equal(src, 'https://streamable.com/e/abc');
  });
  it('Streamable with all flags', () => {
    const src = buildEmbedSrc(
      { provider: 'streamable', id: 'abc', aspectRatio: '16/9' },
      { autoplay: true, mute: true, loop: true },
    );
    assert.ok(src.includes('autoplay=1'));
    assert.ok(src.includes('muted=1'));
    assert.ok(src.includes('loop=1'));
  });
});
