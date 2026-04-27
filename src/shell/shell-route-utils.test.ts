import { describe, expect, it } from 'vitest';
import type { ShellRouteContext } from './extras/types';
import {
  getShellActionsFromMatches,
  getShellContentLayoutFromMatches,
  getShellPanelViewsFromMatches,
  getShellTabsFromMatches,
} from './shell-route-utils';

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
});
