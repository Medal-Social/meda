import type { PlatformId } from '../types.js';
export interface PlatformMeta {
    /** Human-readable name (e.g. "Twitter / X"). */
    displayName: string;
    /** Platform brand color (hex with leading #). */
    brandColor: string;
    /** Soft per-platform character limit (consumers may override per render). */
    characterLimit: number;
}
export declare const PLATFORM_META: Record<PlatformId, PlatformMeta>;
