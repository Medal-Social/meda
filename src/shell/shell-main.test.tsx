import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ShellMain } from './shell-main.js';

describe('ShellMain — default layout="workspace"', () => {
  it('applies max-w-[1280px] and padding classes', () => {
    render(
      <ShellMain>
        <div data-testid="content" />
      </ShellMain>
    );
    const main = screen.getByRole('main');
    expect(main.className).toContain('max-w-[1280px]');
    expect(main.className).toMatch(/px-4|py-6/);
  });

  it('sets data-meda-shell-main-layout="workspace"', () => {
    render(
      <ShellMain>
        <div />
      </ShellMain>
    );
    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('data-meda-shell-main-layout', 'workspace');
  });
});

describe('ShellMain — layout="centered"', () => {
  it('sets data-meda-shell-main-layout="centered"', () => {
    render(
      <ShellMain layout="centered">
        <div />
      </ShellMain>
    );
    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('data-meda-shell-main-layout', 'centered');
  });

  it('applies mx-auto and max-w-2xl', () => {
    render(
      <ShellMain layout="centered">
        <div />
      </ShellMain>
    );
    const main = screen.getByRole('main');
    expect(main.className).toContain('max-w-2xl');
    expect(main.className).toContain('mx-auto');
  });
});

describe('ShellMain — layout="fullbleed"', () => {
  it('sets data-meda-shell-main-layout="fullbleed"', () => {
    render(
      <ShellMain layout="fullbleed">
        <div />
      </ShellMain>
    );
    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('data-meda-shell-main-layout', 'fullbleed');
  });

  it('does not apply any max-width or horizontal padding', () => {
    render(
      <ShellMain layout="fullbleed">
        <div />
      </ShellMain>
    );
    const main = screen.getByRole('main');
    expect(main.className).not.toMatch(/max-w-/);
    expect(main.className).not.toMatch(/px-/);
  });
});

describe('ShellMain — content-visibility', () => {
  it('applies [content-visibility:auto] class on every layout', () => {
    const { rerender } = render(
      <ShellMain>
        <div />
      </ShellMain>
    );
    expect(screen.getByRole('main').className).toContain('[content-visibility:auto]');

    rerender(
      <ShellMain layout="centered">
        <div />
      </ShellMain>
    );
    expect(screen.getByRole('main').className).toContain('[content-visibility:auto]');

    rerender(
      <ShellMain layout="fullbleed">
        <div />
      </ShellMain>
    );
    expect(screen.getByRole('main').className).toContain('[content-visibility:auto]');
  });
});

describe('ShellMain — custom className', () => {
  it('merges custom className with layout classes', () => {
    render(
      <ShellMain className="custom-extra">
        <div />
      </ShellMain>
    );
    const main = screen.getByRole('main');
    expect(main.className).toContain('max-w-[1280px]');
    expect(main.className).toContain('custom-extra');
  });
});
