import '@testing-library/jest-dom/vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip.js';

describe('Tooltip adapter', () => {
  it('renders portaled tooltip content on mouseenter (jsdom + Portal pattern)', async () => {
    render(
      <TooltipProvider>
        <Tooltip>
          {/* render prop replaces the default <button> so there is no nested button */}
          {/* biome-ignore lint/a11y/noNoninteractiveTabindex: test-only trigger stub */}
          <TooltipTrigger render={<span data-testid="trigger" tabIndex={0} />}>
            Hover me
          </TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    await act(async () => {
      fireEvent.mouseEnter(screen.getByTestId('trigger'));
    });

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByRole('tooltip')).toHaveTextContent('Tooltip text');
  });

  it('exposes TooltipProvider, Tooltip, TooltipTrigger, TooltipContent as named exports', () => {
    expect(typeof TooltipProvider).toBe('function');
    expect(typeof Tooltip).toBe('function');
    expect(typeof TooltipTrigger).toBe('function');
    expect(typeof TooltipContent).toBe('function');
  });
});
