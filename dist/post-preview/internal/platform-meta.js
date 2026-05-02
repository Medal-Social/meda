export const PLATFORM_META = {
    twitter: { displayName: 'X', brandColor: '#000000', characterLimit: 280 },
    linkedin: { displayName: 'LinkedIn', brandColor: '#0A66C2', characterLimit: 3000 },
    instagram: { displayName: 'Instagram', brandColor: '#E4405F', characterLimit: 2200 },
    facebook: { displayName: 'Facebook', brandColor: '#1877F2', characterLimit: 63206 },
    threads: { displayName: 'Threads', brandColor: '#000000', characterLimit: 500 },
    bluesky: { displayName: 'Bluesky', brandColor: '#0085FF', characterLimit: 300 },
    tiktok: { displayName: 'TikTok', brandColor: '#000000', characterLimit: 4000 },
    youtube: { displayName: 'YouTube', brandColor: '#FF0000', characterLimit: 5000 },
    google_business: { displayName: 'Google Business', brandColor: '#4285F4', characterLimit: 1500 },
    telegram: { displayName: 'Telegram', brandColor: '#26A5E4', characterLimit: 4096 },
    discord: { displayName: 'Discord', brandColor: '#5865F2', characterLimit: 2000 },
};
/**
 * Resolve a Lucide icon to use as a platform glyph. Returns `undefined`
 * when no built-in glyph is appropriate; consumers should render their
 * own brand SVG in that case (e.g. inside chrome components).
 *
 * This indirection lets platform-meta stay icon-agnostic while still
 * enabling chromes to render a default glyph.
 */
export function platformIconHint(platform) {
    // Lucide does not ship official social brand glyphs; chromes render their
    // own inline SVGs. Return undefined to make the absence explicit.
    void platform;
    return undefined;
}
