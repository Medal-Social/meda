// SPDX-License-Identifier: Apache-2.0

import { Canvas } from '@react-three/fiber';
import * as React from 'react';
import type { TurnPhase } from './types.js';
import { Scene } from './voice-orb-scene.js';

// Note: CSS for `.meda-voice-orb` is shipped via @medalsocial/meda/styles.css
// (re-exported from globals.css). We avoid a JS-side CSS import here so
// Meda's tsc-only build pipeline doesn't need CSS bundling.

// ---------------------------------------------------------------------------
// Theming helpers
// ---------------------------------------------------------------------------

function hslToHex(hsl: string): string {
  const match = hsl.match(/(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%/);
  if (!match) return '#9A6AC2'; // Pilot purple fallback
  const h = Number(match[1]);
  const s = Number(match[2]) / 100;
  const l = Number(match[3]) / 100;

  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function readMedaColors(el: HTMLElement): [string, string] {
  const style = getComputedStyle(el);
  const primary = style.getPropertyValue('--primary').trim();
  const accent = style.getPropertyValue('--accent').trim();
  const colorA = hslToHex(primary);
  const colorB = accent ? hslToHex(accent) : colorA;
  return [colorA, colorB];
}

const DEFAULT_COLORS: [string, string] = ['#9A6AC2', '#7B4FAB'];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface VoiceOrbProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Held / not held. Drives the squish + halo intensity. */
  pressed: boolean;
  /** 0..1 mic input level. Drives shader input-volume uniform. */
  level?: number;
  /** 0..1 TTS playback level. Drives shader output-volume uniform. */
  outputLevel?: number;
  /** Visual phase. Drives state-specific shader behavior. */
  phase?: TurnPhase;
  /** Diameter in px. Defaults to 144. */
  size?: number;
  disabled?: boolean;
  /** A11y label. Defaults to "Hold to talk". */
  label?: string;
  /**
   * Override the gradient pair [colorA, colorB]. If omitted, reads --primary
   * and --accent from CSS at mount and on theme change.
   */
  colors?: [string, string];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const VoiceOrb = React.forwardRef<HTMLButtonElement, VoiceOrbProps>(function VoiceOrb(
  {
    pressed,
    level = 0,
    outputLevel = 0,
    phase = 'idle',
    size = 144,
    disabled,
    label = 'Hold to talk',
    colors: colorsProp,
    className,
    style,
    ...rest
  },
  ref
) {
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  // Merge forwarded ref
  React.useImperativeHandle(ref, () => buttonRef.current as HTMLButtonElement);

  // Resolved theme colors (from CSSOM unless overridden by prop)
  const [resolvedColors, setResolvedColors] = React.useState<[string, string]>(
    colorsProp ?? DEFAULT_COLORS
  );

  // prefers-reduced-motion
  const [reducedMotion, setReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Theme color resolution
  React.useEffect(() => {
    if (colorsProp) {
      setResolvedColors(colorsProp);
      return;
    }

    const update = () => {
      setResolvedColors(readMedaColors(document.documentElement));
    };

    update();

    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });
    return () => observer.disconnect();
  }, [colorsProp]);

  const btnStyle: React.CSSProperties = {
    width: size,
    height: size,
    ...style,
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      aria-pressed={pressed}
      aria-label={label}
      disabled={disabled}
      data-phase={phase}
      data-pressed={pressed}
      className={[
        'meda-voice-orb',
        'relative inline-flex items-center justify-center rounded-full',
        'select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'transition-transform duration-200 ease-out',
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
        pressed ? 'scale-[0.97]' : 'scale-100',
        className ?? '',
      ].join(' ')}
      style={btnStyle}
      {...rest}
    >
      <Canvas
        gl={{ alpha: true, antialias: true, premultipliedAlpha: true }}
        style={{ pointerEvents: 'none' }}
      >
        <Scene
          level={level}
          outputLevel={outputLevel}
          phase={phase}
          colors={resolvedColors}
          reducedMotion={reducedMotion}
          pressed={pressed}
        />
      </Canvas>
    </button>
  );
});
