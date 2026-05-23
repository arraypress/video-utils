# @arraypress/video-utils

> Parse + embed video URLs from YouTube, Vimeo, TikTok, Instagram,
> SoundCloud, Spotify, Twitch, Loom, Wistia, Streamable.

Zero dependencies. ESM-only. Works in Node.js, Cloudflare Workers,
Deno, Bun, and browsers.

## Install

```bash
npm install @arraypress/video-utils
```

## Quick start

```js
import { parseVideoUrl, buildEmbedSrc } from '@arraypress/video-utils';

const parsed = parseVideoUrl({ url: 'https://youtu.be/dQw4w9WgXcQ' });
// → { provider: 'youtube', id: 'dQw4w9WgXcQ', aspectRatio: '16/9' }

const src = buildEmbedSrc(parsed, { autoplay: true, mute: true });
// → 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&autoplay=1&mute=1'
```

Render the embed:

```html
<div style={`aspect-ratio: ${parsed.aspectRatio}`}>
  <iframe
    src={src}
    allow="autoplay; encrypted-media; picture-in-picture"
    allowfullscreen
    loading="lazy"
  />
</div>
```

## Supported providers + URL formats

```
YouTube:
  https://www.youtube.com/watch?v=ID
  https://youtube.com/embed/ID
  https://youtube.com/shorts/ID
  https://youtu.be/ID

Vimeo:
  https://vimeo.com/ID
  https://vimeo.com/video/ID

TikTok:
  https://www.tiktok.com/@user/video/ID
  https://www.tiktok.com/embed/v2/ID

Instagram:
  https://www.instagram.com/p/SHORTCODE/      (post)
  https://www.instagram.com/reel/SHORTCODE/   (reel — 9:16)
  https://www.instagram.com/tv/SHORTCODE/     (IGTV)

SoundCloud:
  https://soundcloud.com/USER/TRACK
  https://soundcloud.com/USER/sets/PLAYLIST

Spotify:
  https://open.spotify.com/track/ID
  https://open.spotify.com/album/ID
  https://open.spotify.com/playlist/ID
  https://open.spotify.com/episode/ID
  https://open.spotify.com/show/ID

Twitch:
  https://www.twitch.tv/videos/NUMERIC_ID
  https://clips.twitch.tv/CLIP_SLUG
  https://www.twitch.tv/USER/clip/CLIP_SLUG

Loom:
  https://www.loom.com/share/ID
  https://www.loom.com/embed/ID

Wistia:
  https://ACCOUNT.wistia.com/medias/ID
  https://fast.wistia.net/embed/iframe/ID

Streamable:
  https://streamable.com/ID
  https://streamable.com/e/ID
```

## `buildEmbedSrc` options

| Option            | Default       | Providers                                                            |
|-------------------|---------------|----------------------------------------------------------------------|
| `autoplay`        | `false`       | youtube · vimeo · tiktok · twitch · loom · streamable                |
| `mute`            | `false`       | youtube · vimeo · twitch · streamable                                |
| `loop`            | `false`       | youtube · vimeo · streamable                                         |
| `rel`             | `false`       | youtube (default is `rel=0` — hides related videos)                  |
| `modestbranding`  | `false`       | youtube                                                              |
| `parent`          | `'localhost'` | twitch (required by Twitch for any iframe embed)                     |

## Privacy

- **YouTube** uses the `youtube-nocookie.com` host so first paint
  doesn't set tracking cookies — important for GDPR consent flows
  where you only want to load the embed *after* the user has
  accepted cookies.
- **Vimeo** is built with `dnt=1` (Do Not Track) by default.

## TypeScript

Ships with `.d.ts`:

```ts
import {
  parseVideoUrl,
  buildEmbedSrc,
  type VideoProvider,
  type ParsedVideo,
  type EmbedOptions,
} from '@arraypress/video-utils';
```

## License

MIT
