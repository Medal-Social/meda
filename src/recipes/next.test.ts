import { describe, expect, it } from 'vitest';
import { nextAppShellRecipe, nextRecipes } from './next.js';

describe('Next recipes', () => {
  it('publishes copyable Next AppShell recipe metadata', () => {
    expect(nextRecipes).toContain(nextAppShellRecipe);
    expect(nextAppShellRecipe.name).toBe('meda-next-app-shell');
    expect(nextAppShellRecipe.dependencies).toContain('@medalsocial/meda');
    expect(nextAppShellRecipe.peerDependencies).toEqual(
      expect.arrayContaining(['next', 'react', 'react-dom'])
    );
    expect(nextAppShellRecipe.files[0]?.content).toContain('next/link');
  });

  it('passes route panel views to AppShell on first render', () => {
    expect(nextAppShellRecipe.files[0]?.content).toContain(
      'rightPanel={{ panelViews, defaultView: defaultPanelView }}'
    );
    expect(nextAppShellRecipe.files[0]?.content).not.toContain('panelViews: []');
  });

  it('documents the current workspace shell extension points', () => {
    const content = nextAppShellRecipe.files[0]?.content ?? '';

    expect(content).toContain('headerCenter');
    expect(content).toContain('banners');
    expect(content).toContain('mainLayout');
    expect(content).toContain('mainClassName');
    expect(content).toContain('workspaceMenuItems');
    expect(content).toContain('workspaceMenuFooter');
    expect(content).toContain('appTabs');
    expect(content).toContain('app.to');
    expect(content).not.toContain('<CommandPalette');
  });

  it('uses .tsx targets for JSX-bearing recipe files', () => {
    for (const file of nextAppShellRecipe.files) {
      if (file.content.includes('<')) {
        expect(file.path).toMatch(/\.tsx$/);
        expect(file.target).toMatch(/\.tsx$/);
      }
    }
  });

  it('documents accessibility and composition contracts', () => {
    expect(nextAppShellRecipe.accessibility.length).toBeGreaterThan(0);
    expect(nextAppShellRecipe.composition.length).toBeGreaterThan(0);
    expect(nextAppShellRecipe.accessibility).toEqual(
      expect.arrayContaining([
        expect.stringContaining('linkProps'),
        expect.stringContaining('aria-current'),
        expect.stringContaining('Auth provider buttons'),
        expect.stringContaining('headings'),
        expect.stringContaining('Reduced-motion'),
      ])
    );
    expect(nextAppShellRecipe.composition).toEqual(
      expect.arrayContaining([
        expect.stringContaining('MedaShellProvider'),
        expect.stringContaining('AppShell'),
        expect.stringContaining('rightPanel'),
        expect.stringContaining('PanelViewsProvider'),
        expect.stringContaining('renderLink'),
      ])
    );
  });
});
