# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] — Unreleased

### Initial Release

- `parseVideoUrl({ url? id? provider? })` — parse a freeform video /
  audio URL into `{ provider, id, kind?, aspectRatio }`. Recognises
  10 providers: YouTube, Vimeo, TikTok, Instagram, SoundCloud,
  Spotify, Twitch, Loom, Wistia, Streamable.
- `buildEmbedSrc(parsed, opts?)` — build the iframe `src` URL for the
  matching embed widget. Privacy-respecting by default (YouTube
  nocookie host, Vimeo `dnt=1`).

45 tests passing. ESM-only, zero dependencies.
