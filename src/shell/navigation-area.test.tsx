import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { NavigationArea } from './navigation-area';

afterEach(() => {
  cleanup();
});

describe('NavigationArea', () => {
  it('renders navigation children inside the desktop wrapper', () => {
    render(
      <NavigationArea>
        <div>App Rail</div>
        <div>Section Sidebar</div>
      </NavigationArea>
    );

    expect(screen.getByText('App Rail')).toBeInTheDocument();
    expect(screen.getByText('Section Sidebar')).toBeInTheDocument();
  });
});
