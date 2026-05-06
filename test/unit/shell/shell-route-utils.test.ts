import { describe, expect, it } from 'vitest';
import type { ShellRouteContext } from '../../../src/shell/extras/types';
import {
  getShellActionsFromMatches,
  getShellContentLayoutFromMatches,
  getShellPanelViewsFromMatches,
  getShellTabsFromMatches,
} from '../../../src/shell/shell-route-utils';

describe('shell-route-utils', () => {
  it('resolves content layout from the last route handle', () => {
    expect(
      getShellContentLayoutFromMatches([
        { handle: { shellContentLayout: 'workspace' } },
        { handle: { shellContentLayout: 'fullbleed' } },
      ])
    ).toBe('fullbleed');
  });

  it('falls back to workspace layout when no route handle is present', () => {
    expect(getShellContentLayoutFromMatches([])).toBe('workspace');
  });

  it('returns static shell tabs from the last route handle', () => {
    const tabs = [{ id: 'overview', label: 'Overview', to: '/frame' }];

    expect(
      getShellTabsFromMatches([{ handle: { shellTabs: tabs }, params: { id: 'frame' } }], '/frame')
    ).toEqual(tabs);
  });

  it('evaluates functional shell tabs against route params and pathname', () => {
    const tabs = getShellTabsFromMatches(
      [
        {
          handle: {
            shellTabs: ({ params, pathname }: ShellRouteContext) => [
              {
                id: params.id ?? 'unknown',
                label: pathname,
                to: pathname,
              },
            ],
          },
          params: { id: 'frame-13' },
        },
      ],
      '/lab/products/frame-13'
    );

    expect(tabs).toEqual([
      {
        id: 'frame-13',
        label: '/lab/products/frame-13',
        to: '/lab/products/frame-13',
      },
    ]);
  });

  it('returns static shell actions and panel views from the last route handle', () => {
    const action = { type: 'button', props: { children: 'Create' } };
    const matches = [
      {
        handle: {
          shellActions: action,
          shellPanelViews: ['overview', 'activity'],
        },
      },
    ];

    expect(getShellActionsFromMatches(matches, '/lab')).toBe(action);
    expect(getShellPanelViewsFromMatches(matches)).toEqual(['overview', 'activity']);
  });

  it('evaluates functional shell actions against route params and pathname', () => {
    const result = getShellActionsFromMatches(
      [
        {
          handle: {
            shellActions: ({
              params,
              pathname,
            }: {
              params: Record<string, string | undefined>;
              pathname: string;
            }) => `${params.id ?? 'unknown'}:${pathname}`,
          },
          params: { id: 'frame-42' },
        },
      ],
      '/lab/frame-42'
    );

    expect(result).toBe('frame-42:/lab/frame-42');
  });

  it('returns null from getShellActionsFromMatches when no handle present', () => {
    expect(getShellActionsFromMatches([], '/lab')).toBeNull();
  });

  it('returns empty array from getShellTabsFromMatches when no handle present', () => {
    expect(getShellTabsFromMatches([], '/lab')).toEqual([]);
  });

  it('evaluates functional shell tabs with empty params when match has no params', () => {
    const tabs = getShellTabsFromMatches(
      [
        {
          handle: {
            shellTabs: ({
              params,
            }: {
              params: Record<string, string | undefined>;
              pathname: string;
            }) => [{ id: params.id ?? 'fallback', label: 'Tab', to: '/tab' }],
          },
          // no params field — exercises the `params ?? {}` branch
        },
      ],
      '/tab'
    );
    expect(tabs).toEqual([{ id: 'fallback', label: 'Tab', to: '/tab' }]);
  });

  it('evaluates functional shell actions with empty params when match has no params', () => {
    const result = getShellActionsFromMatches(
      [
        {
          handle: {
            shellActions: ({
              params,
            }: {
              params: Record<string, string | undefined>;
              pathname: string;
            }) => params.id ?? 'no-id',
          },
          // no params field — exercises the `params ?? {}` branch
        },
      ],
      '/test'
    );
    expect(result).toBe('no-id');
  });
});
