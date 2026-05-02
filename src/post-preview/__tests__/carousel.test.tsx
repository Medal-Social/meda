import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BASE_FIXTURE, FIXTURE_MEDIA } from '../__stories__/fixtures.js';
import { InstagramPreview } from '../platforms/index.js';

describe('Instagram carousel', () => {
  const mediaUrls = [FIXTURE_MEDIA.square, FIXTURE_MEDIA.landscape, FIXTURE_MEDIA.portrait];

  it('renders dot navigation matching the number of slides', () => {
    render(<InstagramPreview {...BASE_FIXTURE} mediaUrls={mediaUrls} />);
    const dots = screen.getAllByRole('button', { name: /go to slide/i });
    expect(dots).toHaveLength(mediaUrls.length);
  });

  it('advances slides when a dot is clicked', () => {
    render(<InstagramPreview {...BASE_FIXTURE} mediaUrls={mediaUrls} />);
    const dots = screen.getAllByRole('button', { name: /go to slide/i });
    fireEvent.click(dots[2]);
    expect(dots[2]).toHaveAttribute('aria-current', 'true');
  });

  it('advances on left swipe', () => {
    const { container } = render(<InstagramPreview {...BASE_FIXTURE} mediaUrls={mediaUrls} />);
    const swipe = container.querySelector('[data-slot="instagram-carousel-track"]');
    expect(swipe).not.toBeNull();
    if (!swipe) throw new Error('unreachable');
    fireEvent.touchStart(swipe, { touches: [{ clientX: 200 }] });
    fireEvent.touchEnd(swipe, { changedTouches: [{ clientX: 50 }] });
    const dots = screen.getAllByRole('button', { name: /go to slide/i });
    expect(dots[1]).toHaveAttribute('aria-current', 'true');
  });

  it('advances on ArrowRight key press', () => {
    render(<InstagramPreview {...BASE_FIXTURE} mediaUrls={mediaUrls} />);
    const track = document.querySelector('[data-slot="instagram-carousel-track"]') as HTMLElement;
    expect(track).not.toBeNull();
    fireEvent.keyDown(track, { key: 'ArrowRight' });
    const dots = screen.getAllByRole('button', { name: /go to slide/i });
    expect(dots[1]).toHaveAttribute('aria-current', 'true');
  });

  it('goes back on ArrowLeft key press from a non-first slide', () => {
    render(<InstagramPreview {...BASE_FIXTURE} mediaUrls={mediaUrls} />);
    const track = document.querySelector('[data-slot="instagram-carousel-track"]') as HTMLElement;
    fireEvent.keyDown(track, { key: 'ArrowRight' });
    fireEvent.keyDown(track, { key: 'ArrowRight' });
    fireEvent.keyDown(track, { key: 'ArrowLeft' });
    const dots = screen.getAllByRole('button', { name: /go to slide/i });
    expect(dots[1]).toHaveAttribute('aria-current', 'true');
  });

  it('declares touch-action: pan-y on the swipeable track', () => {
    render(<InstagramPreview {...BASE_FIXTURE} mediaUrls={mediaUrls} />);
    const track = document.querySelector('[data-slot="instagram-carousel-track"]') as HTMLElement;
    expect(track.style.touchAction).toBe('pan-y');
  });
});
