import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Avatar } from './avatar.js';

describe('Avatar (post-preview internal)', () => {
  it('renders the image when src is provided', () => {
    render(<Avatar src="https://example.com/me.png" displayName="Acme Studios" />);
    const img = screen.getByRole('img', { name: 'Acme Studios' });
    expect(img).toHaveAttribute('src', 'https://example.com/me.png');
  });

  it('falls back to initials when src is missing', () => {
    render(<Avatar displayName="Acme Studios" />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('falls back to initials when image fails to load', () => {
    render(<Avatar src="bad-url" displayName="Bravo Co" />);
    const img = screen.getByRole('img', { name: 'Bravo Co' });
    fireEvent.error(img);
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('forwards className to the wrapper', () => {
    render(<Avatar displayName="A" className="custom-class" />);
    expect(screen.getByText('A').parentElement).toHaveClass('custom-class');
  });
});
