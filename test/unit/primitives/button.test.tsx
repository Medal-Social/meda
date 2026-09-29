import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { Button } from '../../../src/primitives/button.js';

describe('Button', () => {
  it('renders a type="button" with primary / md defaults', () => {
    render(<Button>Book</Button>);
    const button = screen.getByRole('button', { name: 'Book' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('data-variant', 'primary');
    expect(button).toHaveAttribute('data-size', 'md');
    expect(button).toHaveClass('bg-primary', 'text-primary-foreground');
  });

  it.each([
    ['secondary', 'bg-secondary'],
    ['ghost', 'hover:bg-accent'],
    ['outline', 'border-border'],
  ] as const)('applies the %s variant with semantic tokens', (variant, token) => {
    render(<Button variant={variant}>Go</Button>);
    expect(screen.getByRole('button')).toHaveClass(token);
  });

  it.each([
    ['sm', 'h-8'],
    ['md', 'h-10'],
    ['lg', 'h-11'],
  ] as const)('applies the %s size', (size, height) => {
    render(<Button size={size}>Go</Button>);
    expect(screen.getByRole('button')).toHaveClass(height);
  });

  it('keeps a submit type when asked', () => {
    render(<Button type="submit">Send</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('loading: busy, still focusable, swallows clicks, announces the label', () => {
    const onClick = vi.fn();
    render(
      <Button loading loadingLabel="Booking" onClick={onClick}>
        Book
      </Button>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).not.toBeDisabled();
    expect(button).toHaveTextContent('BookingBook');
    expect(button.querySelector('[data-slot="button-spinner"]')).toHaveAttribute(
      'aria-hidden',
      'true'
    );

    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
    button.focus();
    expect(button).toHaveFocus();
  });

  it('fires onClick when idle and not when disabled', () => {
    const onClick = vi.fn();
    const { rerender } = render(<Button onClick={onClick}>Go</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(
      <Button disabled onClick={onClick}>
        Go
      </Button>
    );
    expect(screen.getByRole('button')).toBeDisabled();
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders through the render prop and merges classes', () => {
    render(
      <Button variant="outline" render={<a href="/book" className="consumer" />}>
        Book now
      </Button>
    );
    const link = screen.getByRole('link', { name: 'Book now' });
    expect(link).toHaveAttribute('href', '/book');
    expect(link).toHaveClass('consumer', 'border-border');
    expect(link).toHaveAttribute('data-slot', 'button');
    expect(link).not.toHaveAttribute('type');
  });

  it('exposes disabled on a rendered link via aria-disabled and blocks clicks', () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick} render={<a href="/book" />}>
        Book
      </Button>
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('aria-disabled', 'true');
    expect(link).toHaveAttribute('data-disabled', 'true');
    fireEvent.click(link);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('forwards refs', () => {
    let node: HTMLButtonElement | null = null;
    render(
      <Button
        ref={(el) => {
          node = el;
        }}
      >
        Go
      </Button>
    );
    expect(node).toBeInstanceOf(HTMLButtonElement);
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <div>
        <Button>Primary</Button>
        <Button variant="outline" loading>
          Saving
        </Button>
      </div>
    );
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    ).toHaveNoViolations();
  });
});
