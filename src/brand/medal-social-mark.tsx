import type { SVGProps } from 'react';

export interface MedalSocialMarkProps extends SVGProps<SVGSVGElement> {
  title?: string;
  backgroundColor?: string;
  markColor?: string;
}

export function MedalSocialMark({
  title,
  backgroundColor = 'hsl(0, 0%, 10%)',
  markColor = 'hsl(0, 0%, 90%)',
  role,
  focusable = 'false',
  'aria-hidden': ariaHidden,
  ...props
}: MedalSocialMarkProps) {
  const accessibleTitle = title?.trim();
  const hasAccessibleName = Boolean(
    accessibleTitle || props['aria-label'] || props['aria-labelledby']
  );

  return (
    <svg
      {...props}
      viewBox="0 0 48 48"
      fill="none"
      role={hasAccessibleName ? (role ?? 'img') : role}
      aria-hidden={hasAccessibleName ? ariaHidden : (ariaHidden ?? true)}
      focusable={focusable}
    >
      <title>{accessibleTitle || 'Medal Social'}</title>
      <circle cx="24" cy="24" r="23" fill={backgroundColor} />
      <path d="M8 24L24 8L40 24L24 40L8 24Z" stroke={markColor} strokeWidth="1.3" fill="none" />
      <circle cx="24" cy="8.5" r="2.5" fill={markColor} />
      <circle cx="39.5" cy="24" r="2.5" fill={markColor} />
      <circle cx="24" cy="39.5" r="2.5" fill={markColor} />
      <circle cx="8.5" cy="24" r="2.5" fill={markColor} />
      <g transform="translate(12, 12) scale(1)">
        <path
          d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"
          fill="none"
          stroke={markColor}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
