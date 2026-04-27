import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu.js';

describe('DropdownMenuItem', () => {
  it('fires onSelect handlers in the real Base UI menu', () => {
    const handleSelect = vi.fn();
    const handleClick = vi.fn();

    render(
      <DropdownMenu>
        <DropdownMenuTrigger render={<button type="button" />}>Actions</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={handleSelect}>Share</DropdownMenuItem>
          <DropdownMenuItem onClick={handleClick}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Actions' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Share' }));

    expect(handleSelect).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Actions' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Delete' }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders portaled menu content after trigger click (jsdom + Portal pattern)', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger render={<button type="button" />}>Open</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item One</DropdownMenuItem>
          <DropdownMenuItem>Item Two</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    // Before opening: items should not be visible
    expect(screen.queryByRole('menuitem', { name: 'Item One' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Open' }));

    // After opening: portaled items should be queryable via screen
    expect(screen.getByRole('menuitem', { name: 'Item One' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Item Two' })).toBeInTheDocument();
  });
});
