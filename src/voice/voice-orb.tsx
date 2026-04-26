import * as React from 'react';
import type { TurnPhase } from './types.js';

export interface VoiceOrbProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pressed: boolean;
  level?: number;
  phase?: TurnPhase;
  size?: number;
  disabled?: boolean;
  label?: string;
}

export const VoiceOrb = React.forwardRef<HTMLButtonElement, VoiceOrbProps>(function VoiceOrb(
  {
    pressed,
    level = 0,
    phase = 'idle',
    size = 144,
    disabled,
    label = 'Hold to talk',
    className,
    style,
    ...rest
  },
  ref
) {
  const intensity = 0.4 + Math.min(1, Math.max(0, level)) * 0.6;
  const haloBlur = 8 + Math.min(1, Math.max(0, level)) * 24;
  const styleVar: React.CSSProperties = {
    width: size,
    height: size,
    ['--meda-orb-intensity' as never]: intensity,
    ['--meda-orb-halo-blur' as never]: `${haloBlur}px`,
    ...style,
  };
  return (
    <button
      ref={ref}
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
      style={styleVar}
      {...rest}
    >
      <span aria-hidden className="meda-voice-orb__halo absolute inset-0 rounded-full" />
      <span aria-hidden className="meda-voice-orb__core absolute inset-0 rounded-full" />
      <span
        aria-hidden
        className="meda-voice-orb__label relative text-[11px] font-medium tracking-[0.08em] text-primary-foreground/80"
      >
        HOLD
      </span>
    </button>
  );
});
