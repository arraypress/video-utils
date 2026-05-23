/**
 * @arraypress/video-utils
 *
 * Parse freeform video / audio URLs into a normalised
 * `{ provider, id, kind?, aspectRatio }` shape, then build the
 * iframe `src` URL for the matching embed widget.
 *
 * Supported providers: YouTube, Vimeo, TikTok, Instagram,
 * SoundCloud, Spotify, Twitch, Loom, Wistia, Streamable.
 *
 * Zero dependencies. Works in Node.js, Cloudflare Workers, Deno,
 * Bun, and browsers.
 *
 * Adding a new provider:
 *   1. Add a key to the `VideoProvider` JSDoc union below.
 *   2. Add a regex case to `parseVideoUrl` that returns
 *      `{ provider, id, kind?, aspectRatio }`.
 *   3. Add a `case 'provider':` to `buildEmbedSrc` that emits the
 *      iframe `src` URL.
 *   4. Update the `.d.ts` union to match.
 *
 * @module @arraypress/video-utils
 */

/**
 * @typedef {'youtube' | 'vimeo' | 'tiktok' | 'instagram' | 'soundcloud' | 'spotify' | 'twitch' | 'loom' | 'wistia' | 'streamable'} VideoProvider
 */

/**
 * @typedef {Object} ParsedVideo
 * @property {VideoProvider} provider
 * @property {string} id - Content identifier (or canonical URL for SoundCloud).
 * @property {string} [kind] - Sub-type for multi-format providers.
 * @property {string} aspectRatio - CSS aspect-ratio suggestion (`'16/9'`, `'9/16'`, `'1/1'`).
 */

/**
 * Best-effort parse of a freeform video / audio URL.
 *
 * Recognised URL formats:
 *
 *   YouTube:
 *     https://www.youtube.com/watch?v=ID
 *     https://youtube.com/embed/ID
 *     https://youtube.com/shorts/ID
 *     https://youtu.be/ID
 *
 *   Vimeo:
 *     https://vimeo.com/ID
 *     https://vimeo.com/video/ID
 *
 *   TikTok:
 *     https://www.tiktok.com/@user/video/ID
 *     https://www.tiktok.com/embed/v2/ID
 *
 *   Instagram (posts, reels, IGTV):
 *     https://www.instagram.com/p/SHORTCODE/
 *     https://www.instagram.com/reel/SHORTCODE/
 *     https://www.instagram.com/tv/SHORTCODE/
 *
 *   SoundCloud (tracks + playlists/sets):
 *     https://soundcloud.com/USER/TRACK
 *     https://soundcloud.com/USER/sets/PLAYLIST
 *
 *   Spotify (tracks, albums, playlists, podcasts):
 *     https://open.spotify.com/track/ID
 *     https://open.spotify.com/album/ID
 *     https://open.spotify.com/playlist/ID
 *     https://open.spotify.com/episode/ID
 *     https://open.spotify.com/show/ID
 *
 *   Twitch (VODs + clips):
 *     https://www.twitch.tv/videos/NUMERIC_ID
 *     https://clips.twitch.tv/CLIP_SLUG
 *     https://www.twitch.tv/USER/clip/CLIP_SLUG
 *
 *   Loom:
 *     https://www.loom.com/share/ID
 *     https://www.loom.com/embed/ID
 *
 *   Wistia:
 *     https://ACCOUNT.wistia.com/medias/ID
 *     https://fast.wistia.net/embed/iframe/ID
 *
 *   Streamable:
 *     https://streamable.com/ID
 *     https://streamable.com/e/ID
 *
 *   Bare ID + provider (skips URL parsing):
 *     parseVideoUrl({ id: 'dQw4w9WgXcQ', provider: 'youtube' })
 *
 * @param {{ url?: string; id?: string; provider?: VideoProvider }} input
 * @returns {ParsedVideo | null}
 *
 * @example
 * parseVideoUrl({ url: 'https://www.tiktok.com/@user/video/7234567890' })
 * // → { provider: 'tiktok', id: '7234567890', aspectRatio: '9/16' }
 */
export function parseVideoUrl(input) {
  if (!input) return null;
  const { url, id, provider } = input;
  if (id && provider) {
    return { provider, id, aspectRatio: defaultAspectFor(provider) };
  }
  if (!url) return null;

  /* YouTube. */
  const yt = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  );
  if (yt) return { provider: 'youtube', id: yt[1], aspectRatio: '16/9' };

  /* Vimeo. */
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return { provider: 'vimeo', id: vm[1], aspectRatio: '16/9' };

  /* TikTok. */
  const tt = url.match(/tiktok\.com\/(?:@[\w.-]+\/video\/|embed\/v2\/)(\d+)/);
  if (tt) return { provider: 'tiktok', id: tt[1], aspectRatio: '9/16' };

  /* Instagram posts / reels / IGTV. */
  const ig = url.match(/instagram\.com\/(p|reel|tv)\/([\w-]+)/);
  if (ig) {
    const kind = ig[1] === 'p' ? 'post' : ig[1];
    const aspectRatio = kind === 'reel' ? '9/16' : '1/1';
    return { provider: 'instagram', id: ig[2], kind, aspectRatio };
  }

  /* SoundCloud — keep the canonical source URL as the id; the embed
   * widget needs it as a `?url=` query param. */
  const sc = url.match(/soundcloud\.com\/([\w-]+(?:\/(?:sets\/)?[\w-]+)?)/);
  if (sc) {
    return {
      provider: 'soundcloud',
      id: `https://soundcloud.com/${sc[1]}`,
      kind: sc[1].includes('/sets/') ? 'playlist' : 'track',
      aspectRatio: '1/1',
    };
  }

  /* Spotify. */
  const sp = url.match(/open\.spotify\.com\/(track|album|playlist|episode|show)\/(\w+)/);
  if (sp) return { provider: 'spotify', id: sp[2], kind: sp[1], aspectRatio: '1/1' };

  /* Twitch VOD. */
  const twVod = url.match(/twitch\.tv\/videos\/(\d+)/);
  if (twVod) return { provider: 'twitch', id: twVod[1], kind: 'video', aspectRatio: '16/9' };

  /* Twitch clip — two URL formats. */
  const twClip = url.match(/(?:clips\.twitch\.tv\/|twitch\.tv\/[\w-]+\/clip\/)([\w-]+)/);
  if (twClip) return { provider: 'twitch', id: twClip[1], kind: 'clip', aspectRatio: '16/9' };

  /* Loom. */
  const lm = url.match(/loom\.com\/(?:share|embed)\/([\w-]+)/);
  if (lm) return { provider: 'loom', id: lm[1], aspectRatio: '16/9' };

  /* Wistia. */
  const ws = url.match(/wistia\.(?:com|net)\/(?:medias\/|embed\/iframe\/)([\w-]+)/);
  if (ws) return { provider: 'wistia', id: ws[1], aspectRatio: '16/9' };

  /* Streamable. */
  const st = url.match(/streamable\.com\/(?:e\/)?([\w-]+)/);
  if (st) return { provider: 'streamable', id: st[1], aspectRatio: '16/9' };

  return null;
}

/* Per-provider fallback when a caller passes `{ id, provider }`. */
function defaultAspectFor(provider) {
  switch (provider) {
    case 'tiktok':
      return '9/16';
    case 'instagram':
    case 'spotify':
    case 'soundcloud':
      return '1/1';
    default:
      return '16/9';
  }
}

/**
 * @typedef {Object} EmbedOptions
 * @property {boolean} [autoplay=false] - Provider applicability: youtube · vimeo · tiktok · twitch · loom · streamable.
 * @property {boolean} [rel=false] - YouTube-only: hide the related-videos sidebar (default behaviour is rel=0).
 * @property {boolean} [modestbranding=false] - YouTube-only: hide the branded title bar.
 * @property {boolean} [mute=false] - Mute audio. Provider applicability: youtube · vimeo · twitch · streamable.
 * @property {boolean} [loop=false] - Loop the video. Provider applicability: youtube · vimeo · streamable.
 * @property {string} [parent='localhost'] - Required by Twitch; hostname serving the iframe.
 */

/**
 * Build the iframe `src` URL for an embedded video / audio item.
 *
 * Privacy:
 *   - YouTube uses `youtube-nocookie.com` to avoid tracking cookies
 *     on first paint (important for GDPR consent flows).
 *   - Vimeo respects Do-Not-Track via `dnt=1` (set by default).
 *
 * @param {ParsedVideo} parsed
 * @param {EmbedOptions} [opts]
 * @returns {string} Fully-qualified iframe `src` URL.
 *
 * @example
 * const parsed = parseVideoUrl({ url: 'https://youtu.be/abc12345678' });
 * buildEmbedSrc(parsed, { autoplay: true, mute: true });
 * // → 'https://www.youtube-nocookie.com/embed/abc12345678?rel=0&autoplay=1&mute=1'
 */
export function buildEmbedSrc(parsed, opts = {}) {
  const {
    autoplay = false,
    rel = false,
    modestbranding = false,
    mute = false,
    loop = false,
    parent = 'localhost',
  } = opts;

  switch (parsed.provider) {
    case 'youtube': {
      const params = new URLSearchParams();
      if (!rel)           params.set('rel', '0');
      if (autoplay)       params.set('autoplay', '1');
      if (modestbranding) params.set('modestbranding', '1');
      if (mute)           params.set('mute', '1');
      if (loop) {
        params.set('loop', '1');
        params.set('playlist', parsed.id);
      }
      return `https://www.youtube-nocookie.com/embed/${parsed.id}?${params.toString()}`;
    }

    case 'vimeo': {
      const params = new URLSearchParams();
      params.set('dnt', '1');
      if (autoplay) params.set('autoplay', '1');
      if (mute)     params.set('muted', '1');
      if (loop)     params.set('loop', '1');
      return `https://player.vimeo.com/video/${parsed.id}?${params.toString()}`;
    }

    case 'tiktok':
      return `https://www.tiktok.com/embed/v2/${parsed.id}${autoplay ? '?autoplay=1' : ''}`;

    case 'instagram': {
      const kindPath = parsed.kind === 'post' ? 'p' : (parsed.kind ?? 'p');
      return `https://www.instagram.com/${kindPath}/${parsed.id}/embed/`;
    }

    case 'soundcloud': {
      const params = new URLSearchParams();
      params.set('url', parsed.id);
      if (autoplay) params.set('auto_play', 'true');
      return `https://w.soundcloud.com/player/?${params.toString()}`;
    }

    case 'spotify':
      return `https://open.spotify.com/embed/${parsed.kind}/${parsed.id}`;

    case 'twitch': {
      const params = new URLSearchParams();
      params.set('parent', parent);
      if (autoplay) params.set('autoplay', 'true');
      if (mute)     params.set('muted', 'true');
      if (parsed.kind === 'clip') {
        params.set('clip', parsed.id);
        return `https://clips.twitch.tv/embed?${params.toString()}`;
      }
      params.set('video', `v${parsed.id}`);
      return `https://player.twitch.tv/?${params.toString()}`;
    }

    case 'loom': {
      const params = new URLSearchParams();
      if (autoplay) params.set('autoplay', '1');
      const qs = params.toString();
      return qs
        ? `https://www.loom.com/embed/${parsed.id}?${qs}`
        : `https://www.loom.com/embed/${parsed.id}`;
    }

    case 'wistia':
      return `https://fast.wistia.net/embed/iframe/${parsed.id}`;

    case 'streamable': {
      const params = new URLSearchParams();
      if (autoplay) params.set('autoplay', '1');
      if (mute)     params.set('muted', '1');
      if (loop)     params.set('loop', '1');
      const qs = params.toString();
      return qs
        ? `https://streamable.com/e/${parsed.id}?${qs}`
        : `https://streamable.com/e/${parsed.id}`;
    }

    default:
      throw new Error(`Unknown provider: ${parsed.provider}`);
  }
}
