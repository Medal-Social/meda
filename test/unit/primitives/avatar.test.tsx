import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { Avatar, getInitials } from '../../../src/primitives/avatar.js';

describe('getInitials', () => {
  it.each([
    ['Ali Aljumaili', 'AA'],
    ['ada', 'A'],
    ['Mary Jane van der Berg', 'MB'],
    ['Ali (Medal) 2', 'AM'],
    ['  åse   øien ', 'ÅØ'],
    ['42 99', ''],
    ['', ''],
    ['@handle', 'H'],
  ])('%j -> %j', (name, expected) => {
    expect(getInitials(name)).toBe(expected);
  });
});

describe('Avatar', () => {
  it('shows the image with the name as the accessible label', () => {
    render(<Avatar name="Ada Lovelace" src="/ada.png" />);
    const avatar = screen.getByRole('img', { name: 'Ada Lovelace' });
    expect(avatar).toHaveAttribute('data-state', 'image');
    const image = avatar.querySelector('img');
    expect(image).toHaveAttribute('src', '/ada.png');
    expect(image).toHaveAttribute('alt', '');
  });

  it('falls back to initials without a src', () => {
    render(<Avatar name="Ada Lovelace" />);
    const avatar = screen.getByRole('img', { name: 'Ada Lovelace' });
    expect(avatar).toHaveAttribute('data-state', 'fallback');
    expect(avatar).toHaveTextContent('AL');
    expect(avatar.querySelector('[data-slot="avatar-fallback"]')).toHaveAttribute(
      'aria-hidden',
      'true'
    );
  });

  it('falls back when the image errors, and retries for a new src', () => {
    const { rerender } = render(<Avatar name="Ada Lovelace" src="/broken.png" />);
    const image = screen.getByRole('img', { name: 'Ada Lovelace' }).querySelector('img');
    if (!image) throw new Error('expected an <img>');
    fireEvent.error(image);
    expect(screen.getByRole('img')).toHaveAttribute('data-state', 'fallback');

    rerender(<Avatar name="Ada Lovelace" src="/fixed.png" />);
    expect(screen.getByRole('img')).toHaveAttribute('data-state', 'image');
  });

  it('honours an explicit initials override and size', () => {
    render(<Avatar name="Cool Kids" initials="C" size="lg" />);
    const avatar = screen.getByRole('img', { name: 'Cool Kids' });
    expect(avatar).toHaveTextContent('C');
    expect(avatar).toHaveClass('size-12');
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <Avatar name="Ada Lovelace" src="/ada.png" />
        <Avatar name="Grace Hopper" />
      </div>
    );
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    ).toHaveNoViolations();
  });
});
