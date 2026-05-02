import type { PlatformId } from '../types.js';

export interface PlatformMeta {
  /** Human-readable name (e.g. "Twitter / X"). */
  displayName: string;
  /** Platform brand color (hex with leading #). */
  brandColor: string;
  /** Soft per-platform character limit (consumers may override per render). */
  characterLimit: number;
}

export const PLATFORM_META: Record<PlatformId, PlatformMeta> = {
  twitter: { displayName: 'X', brandColor: '#000000', characterLimit: 280 },
  linkedin: { displayName: 'LinkedIn', brandColor: '#0A66C2', characterLimit: 3000 },
  instagram: { displayName: 'Instagram', brandColor: '#E4405F', characterLimit: 2200 },
  facebook: { displayName: 'Facebook', brandColor: '#1877F2', characterLimit: 63206 },
  threads: { displayName: 'Threads', brandColor: '#000000', characterLimit: 500 },
  bluesky: { displayName: 'Bluesky', brandColor: '#0085FF', characterLimit: 300 },
  tiktok: { displayName: 'TikTok', brandColor: '#000000', characterLimit: 4000 },
  youtube: { displayName: 'YouTube', brandColor: '#FF0000', characterLimit: 5000 },
  'google-business': {
    displayName: 'Google Business',
    brandColor: '#4285F4',
    characterLimit: 1500,
  },
  telegram: { displayName: 'Telegram', brandColor: '#26A5E4', characterLimit: 4096 },
  discord: { displayName: 'Discord', brandColor: '#5865F2', characterLimit: 2000 },
  generic: { displayName: 'Generic', brandColor: '#6B7280', characterLimit: 63206 },
};
