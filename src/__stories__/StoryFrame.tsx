import type { ReactNode } from 'react';

/**
 * Optional decorator wrapper for stories that want a fixed canvas size or a
 * dark background. Stories pass `width`/`bg` through. Keeps the underlying
 * primitive's stories markup terse.
 */
export function StoryFrame({
  children,
  width = 480,
  bg = 'transparent',
}: {
  children: ReactNode;
  width?: number | string;
  bg?: 'transparent' | 'card' | 'background';
}) {
  let bgClass: string;
  if (bg === 'card') {
    bgClass = 'bg-card';
  } else if (bg === 'background') {
    bgClass = 'bg-background';
  } else {
    bgClass = 'bg-transparent';
  }
  return (
    <div className={['p-4', bgClass].join(' ')} style={{ width }}>
      {children}
    </div>
  );
}
