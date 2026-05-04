import { describe, expect, it } from 'vitest';
import { motion } from '../../../src/shell/motion.js';
import {
  buildShellSectionCommands,
  buildShellShortcutMap,
  getDefaultShellPanelView,
  getShellPanelCollection,
  getShellPanelView,
  isShellPanelViewAvailable,
  resolveShellPanelView,
} from '../../../src/shell/utils.js';

// ---------------------------------------------------------------------------
// motion tokens
// ---------------------------------------------------------------------------

describe('motion tokens', () => {
  it('exports the expected numeric and string tokens', () => {
    expect(motion.fast).toBe(140);
    expect(motion.default).toBe(200);
    expect(motion.panel).toBe(240);
    expect(motion.fullscreen).toBe(280);
    expect(typeof motion.ease).toBe('string');
    expect(motion.spring).toEqual({ stiffness: 420, damping: 34 });
  });
});

// ---------------------------------------------------------------------------
// buildShellShortcutMap
// ---------------------------------------------------------------------------

describe('buildShellShortcutMap', () => {
  it('maps shortcut keys to route paths', () => {
    const map = buildShellShortcutMap({
      inbox: {
        id: 'inbox',
        label: 'Inbox',
        items: [
          { label: 'All', to: '/inbox', shortcut: 'g i', icon: null },
          { label: 'Sent', to: '/inbox/sent', icon: null },
        ],
        icon: null,
      },
    });

    expect(map.get('g i')).toBe('/inbox');
    expect(map.has('g i')).toBe(true);
    // Item without shortcut should not be in map
    expect(map.size).toBe(1);
  });

  it('returns an empty map when no modules have shortcuts', () => {
    const map = buildShellShortcutMap({
      inbox: {
        id: 'inbox',
        label: 'Inbox',
        items: [{ label: 'All', to: '/inbox', icon: null }],
        icon: null,
      },
    });
    expect(map.size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// buildShellSectionCommands
// ---------------------------------------------------------------------------

describe('buildShellSectionCommands', () => {
  it('maps items to ShellCommandDefinition shape', () => {
    const cmds = buildShellSectionCommands(
      { id: 'inbox', items: [{ label: 'All inbox', to: '/inbox', shortcut: 'g i', icon: null }] },
      'Inbox'
    );

    expect(cmds).toHaveLength(1);
    expect(cmds[0]).toMatchObject({
      id: 'inbox:/inbox',
      label: 'All inbox',
      to: '/inbox',
      shortcut: 'g i',
      group: 'Inbox',
    });
  });

  it('returns empty array when module is null', () => {
    expect(buildShellSectionCommands(null)).toEqual([]);
  });

  it('uses "Current Section" as the default group label', () => {
    const cmds = buildShellSectionCommands({
      id: 'x',
      items: [{ label: 'X', to: '/x', icon: null }],
    });
    expect(cmds[0].group).toBe('Current Section');
  });
});

// ---------------------------------------------------------------------------
// getShellPanelCollection
// ---------------------------------------------------------------------------

const PANEL_VIEWS = {
  inbox: [
    { id: 'activity', label: 'Activity' },
    { id: 'details', label: 'Details' },
  ],
};

describe('getShellPanelCollection', () => {
  it('returns views from panelViews[sectionKey] when no selectedProductId', () => {
    const col = getShellPanelCollection({ panelViews: PANEL_VIEWS, sectionKey: 'inbox' });
    expect(col.moduleViews).toHaveLength(2);
    expect(col.views).toHaveLength(2);
    expect(col.globalViews).toHaveLength(0);
  });

  it('merges globalPanelViews into views', () => {
    const global = [{ id: 'global-1', label: 'Global' }];
    const col = getShellPanelCollection({
      panelViews: PANEL_VIEWS,
      sectionKey: 'inbox',
      globalPanelViews: global,
    });
    expect(col.globalViews).toHaveLength(1);
    expect(col.views).toHaveLength(3);
  });

  it('uses productPanelViews when selectedProductId is set', () => {
    const productViews = [{ id: 'product-view', label: 'Product' }];
    const col = getShellPanelCollection({
      panelViews: PANEL_VIEWS,
      sectionKey: 'inbox',
      productPanelViews: productViews,
      selectedProductId: 'prod-1',
    });
    expect(col.moduleViews).toBe(productViews);
  });

  it('returns empty moduleViews when sectionKey has no entry', () => {
    const col = getShellPanelCollection({ panelViews: {}, sectionKey: 'missing' });
    expect(col.moduleViews).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// getDefaultShellPanelView
// ---------------------------------------------------------------------------

describe('getDefaultShellPanelView', () => {
  it('returns the id of the first view', () => {
    expect(getDefaultShellPanelView({ panelViews: PANEL_VIEWS, sectionKey: 'inbox' })).toBe(
      'activity'
    );
  });

  it('returns null when there are no views', () => {
    expect(getDefaultShellPanelView({ panelViews: {}, sectionKey: 'missing' })).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// isShellPanelViewAvailable
// ---------------------------------------------------------------------------

describe('isShellPanelViewAvailable', () => {
  it('returns true when view is in the collection', () => {
    expect(
      isShellPanelViewAvailable({ panelViews: PANEL_VIEWS, sectionKey: 'inbox' }, 'activity')
    ).toBe(true);
  });

  it('returns false when view is not in the collection', () => {
    expect(
      isShellPanelViewAvailable({ panelViews: PANEL_VIEWS, sectionKey: 'inbox' }, 'nonexistent')
    ).toBe(false);
  });

  it('returns false when viewId is null', () => {
    expect(isShellPanelViewAvailable({ panelViews: PANEL_VIEWS, sectionKey: 'inbox' }, null)).toBe(
      false
    );
  });
});

// ---------------------------------------------------------------------------
// resolveShellPanelView
// ---------------------------------------------------------------------------

describe('resolveShellPanelView', () => {
  it('returns viewId when view is available', () => {
    expect(
      resolveShellPanelView({ panelViews: PANEL_VIEWS, sectionKey: 'inbox' }, 'activity')
    ).toBe('activity');
  });

  it('returns the default view when requested view is not available', () => {
    expect(
      resolveShellPanelView({ panelViews: PANEL_VIEWS, sectionKey: 'inbox' }, 'nonexistent')
    ).toBe('activity');
  });

  it('returns null when viewId is null', () => {
    expect(
      resolveShellPanelView({ panelViews: PANEL_VIEWS, sectionKey: 'inbox' }, null)
    ).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getShellPanelView
// ---------------------------------------------------------------------------

describe('getShellPanelView', () => {
  it('returns the view definition when found', () => {
    const view = getShellPanelView({ panelViews: PANEL_VIEWS, sectionKey: 'inbox' }, 'details');
    expect(view).toEqual({ id: 'details', label: 'Details' });
  });

  it('returns null when viewId is null', () => {
    expect(getShellPanelView({ panelViews: PANEL_VIEWS, sectionKey: 'inbox' }, null)).toBeNull();
  });

  it('returns null when view is not found', () => {
    expect(getShellPanelView({ panelViews: PANEL_VIEWS, sectionKey: 'inbox' }, 'ghost')).toBeNull();
  });
});
