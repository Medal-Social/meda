import type { LucideIcon } from 'lucide-react';
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
/**
 * Resolve a Lucide icon to use as a platform glyph. Returns `undefined`
 * when no built-in glyph is appropriate; consumers should render their
 * own brand SVG in that case (e.g. inside chrome components).
 *
 * This indirection lets platform-meta stay icon-agnostic while still
 * enabling chromes to render a default glyph.
 */
export declare function platformIconHint(platform: PlatformId): LucideIcon | undefined;
