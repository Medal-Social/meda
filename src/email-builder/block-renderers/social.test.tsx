import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { SocialBlockProps, SocialLink } from '../types.js';
import { SocialBlock } from './social.js';

const twitterLink: SocialLink = { platform: 'twitter', url: 'https://twitter.com/' };
const linkedinLink: SocialLink = { platform: 'linkedin', url: 'https://linkedin.com/' };

const base: SocialBlockProps = {
  links: [twitterLink, linkedinLink],
  iconSize: 24,
  spacing: 8,
  alignment: 'center',
  padding: { top: 12, right: 24, bottom: 12, left: 24 },
};

describe('SocialBlock', () => {
  it('renders the social slot', () => {
    const { container } = render(<SocialBlock props={base} />);
    expect(container.querySelector('[data-slot="email-block-social"]')).toBeInTheDocument();
  });

  it('renders links for each social platform with a url', () => {
    render(<SocialBlock props={base} />);
    expect(screen.getByRole('link', { name: 'twitter' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'linkedin' })).toBeInTheDocument();
  });

  it('filters out links with empty url', () => {
    const links: SocialLink[] = [
      { platform: 'twitter', url: '' },
      { platform: 'linkedin', url: 'https://linkedin.com/' },
    ];
    render(<SocialBlock props={{ ...base, links }} />);
    expect(screen.queryByRole('link', { name: 'twitter' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'linkedin' })).toBeInTheDocument();
  });

  it('renders no links when all urls are empty', () => {
    const links: SocialLink[] = [
      { platform: 'twitter', url: '' },
      { platform: 'facebook', url: '' },
    ];
    render(<SocialBlock props={{ ...base, links }} />);
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  it('renders no links when links array is empty', () => {
    render(<SocialBlock props={{ ...base, links: [] }} />);
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });

  it('renders platform name as text when no iconUrl', () => {
    render(<SocialBlock props={base} />);
    expect(screen.getByRole('link', { name: 'twitter' })).toHaveTextContent('twitter');
  });

  it('renders an img when iconUrl is set', () => {
    const links: SocialLink[] = [
      {
        platform: 'twitter',
        url: 'https://twitter.com/',
        iconUrl: 'https://cdn.example.com/twitter.png',
      },
    ];
    render(<SocialBlock props={{ ...base, links }} />);
    const img = screen.getByRole('img', { name: 'twitter' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://cdn.example.com/twitter.png');
  });

  it('applies iconSize as width/height on the img', () => {
    const links: SocialLink[] = [
      {
        platform: 'twitter',
        url: 'https://twitter.com/',
        iconUrl: 'https://cdn.example.com/twitter.png',
      },
    ];
    render(<SocialBlock props={{ ...base, links, iconSize: 32 }} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('width', '32');
    expect(img).toHaveAttribute('height', '32');
  });

  it('sets width/height on the anchor when iconUrl is set', () => {
    const links: SocialLink[] = [
      { platform: 'twitter', url: 'https://x.com/', iconUrl: 'https://cdn.example.com/x.png' },
    ];
    render(<SocialBlock props={{ ...base, links, iconSize: 28 }} />);
    const link = screen.getByRole('link', { name: 'twitter' });
    expect(link.style.width).toBe('28px');
    expect(link.style.height).toBe('28px');
  });

  it('does not set width/height on anchor when no iconUrl', () => {
    render(<SocialBlock props={base} />);
    const link = screen.getByRole('link', { name: 'twitter' });
    expect(link.style.width).toBe('');
    expect(link.style.height).toBe('');
  });

  it('applies wrapper alignment', () => {
    const { container } = render(<SocialBlock props={{ ...base, alignment: 'left' }} />);
    const wrapper = container.querySelector('[data-slot="email-block-social"]') as HTMLElement;
    expect(wrapper.style.textAlign).toBe('left');
  });

  it('applies wrapper padding', () => {
    const { container } = render(
      <SocialBlock props={{ ...base, padding: { top: 10, right: 20, bottom: 5, left: 15 } }} />
    );
    const wrapper = container.querySelector('[data-slot="email-block-social"]') as HTMLElement;
    expect(wrapper.style.paddingTop).toBe('10px');
    expect(wrapper.style.paddingRight).toBe('20px');
    expect(wrapper.style.paddingBottom).toBe('5px');
    expect(wrapper.style.paddingLeft).toBe('15px');
  });

  it('sets rel="noopener noreferrer" on links', () => {
    render(<SocialBlock props={base} />);
    for (const link of screen.getAllByRole('link')) {
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    }
  });

  it('sets aria-label to platform name', () => {
    render(<SocialBlock props={base} />);
    expect(screen.getByRole('link', { name: 'twitter' })).toHaveAttribute('aria-label', 'twitter');
  });
});
