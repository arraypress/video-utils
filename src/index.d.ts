/**
 * @arraypress/video-utils — TypeScript definitions.
 */

export type VideoProvider =
  | 'youtube'
  | 'vimeo'
  | 'tiktok'
  | 'instagram'
  | 'soundcloud'
  | 'spotify'
  | 'twitch'
  | 'loom'
  | 'wistia'
  | 'streamable';

export interface ParsedVideo {
  provider: VideoProvider;
  /** Content identifier — bare ID for most providers, canonical
   *  source URL for SoundCloud. */
  id: string;
  /** Sub-type for multi-format providers:
   *    instagram   'post' | 'reel' | 'tv'
   *    spotify     'track' | 'album' | 'playlist' | 'episode' | 'show'
   *    soundcloud  'track' | 'playlist'
   *    twitch      'video' | 'clip' */
  kind?: string;
  /** Suggested CSS aspect-ratio for the iframe wrapper. */
  aspectRatio: string;
}

export interface EmbedOptions {
  autoplay?: boolean;
  /** YouTube-only: hide the related-videos sidebar. Default behaviour is rel=0. */
  rel?: boolean;
  /** YouTube-only: hide the branded title bar. */
  modestbranding?: boolean;
  mute?: boolean;
  loop?: boolean;
  /** Required by Twitch — hostname serving the iframe. Default `'localhost'`. */
  parent?: string;
}

/**
 * Best-effort parse of a freeform video / audio URL.
 *
 * Pass `{ url }` to detect the provider + extract the ID, or
 * `{ id, provider }` to skip URL parsing entirely (useful when
 * the consumer already knows both).
 *
 * Returns `null` when no provider matches.
 */
export function parseVideoUrl(
  input: { url?: string; id?: string; provider?: VideoProvider },
): ParsedVideo | null;

/**
 * Build the iframe `src` URL for an embedded video / audio item.
 *
 * Uses YouTube's nocookie host + Vimeo's `dnt=1` flag for
 * privacy-respecting first paint.
 */
export function buildEmbedSrc(
  parsed: ParsedVideo,
  opts?: EmbedOptions,
): string;
