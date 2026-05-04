import { describe, expect, it } from 'vitest';
import { resolveWorkflowIcon } from '../../../src/workflow-builder/internal/trigger-icons.js';
import {
  getDefaultNodeSentence,
  NODE_HEIGHT,
  NODE_KIND_STYLES,
  NODE_WIDTH,
} from '../../../src/workflow-builder/internal/trigger-sentence.js';

describe('getDefaultNodeSentence', () => {
  it('returns "When <label>" for trigger with label', () => {
    expect(getDefaultNodeSentence('trigger', 'Contact created')).toBe('When contact created');
  });

  it('returns "When event occurs" for trigger without label', () => {
    expect(getDefaultNodeSentence('trigger')).toBe('When event occurs');
  });

  it('returns label for action when provided', () => {
    expect(getDefaultNodeSentence('action', 'Send email')).toBe('Send email');
  });

  it('returns "Run action" for action without label', () => {
    expect(getDefaultNodeSentence('action')).toBe('Run action');
  });

  it('returns label for condition when provided', () => {
    expect(getDefaultNodeSentence('condition', 'Has tag?')).toBe('Has tag?');
  });

  it('returns "Branch on condition" for condition without label', () => {
    expect(getDefaultNodeSentence('condition')).toBe('Branch on condition');
  });

  it('returns label for delay when provided', () => {
    expect(getDefaultNodeSentence('delay', 'Wait 3 days')).toBe('Wait 3 days');
  });

  it('returns "Wait before continuing" for delay without label', () => {
    expect(getDefaultNodeSentence('delay')).toBe('Wait before continuing');
  });

  it('returns label for end when provided', () => {
    expect(getDefaultNodeSentence('end', 'Done')).toBe('Done');
  });

  it('returns "End of workflow" for end without label', () => {
    expect(getDefaultNodeSentence('end')).toBe('End of workflow');
  });

  it('returns label for unknown kind when label is provided', () => {
    // Exercises the default branch in the switch.
    // biome-ignore lint/suspicious/noExplicitAny: testing unreachable branch
    expect(getDefaultNodeSentence('unknown' as any, 'My label')).toBe('My label');
  });

  it('returns empty string for unknown kind without label', () => {
    // biome-ignore lint/suspicious/noExplicitAny: testing unreachable branch
    expect(getDefaultNodeSentence('unknown' as any)).toBe('');
  });
});

describe('NODE_KIND_STYLES', () => {
  it('exports style tokens for all kinds', () => {
    for (const kind of ['trigger', 'action', 'condition', 'delay', 'end'] as const) {
      expect(NODE_KIND_STYLES[kind]).toHaveProperty('bg');
      expect(NODE_KIND_STYLES[kind]).toHaveProperty('border');
      expect(NODE_KIND_STYLES[kind]).toHaveProperty('icon');
    }
  });
});

describe('NODE_WIDTH / NODE_HEIGHT', () => {
  it('exports numeric constants', () => {
    expect(typeof NODE_WIDTH).toBe('number');
    expect(typeof NODE_HEIGHT).toBe('number');
  });
});

describe('resolveWorkflowIcon', () => {
  it('returns KIND_ICONS fallback for trigger with no iconName', () => {
    const Icon = resolveWorkflowIcon('trigger');
    expect(Icon).toBeDefined();
  });

  it('resolves known icon names', () => {
    const names = [
      'zap',
      'webhook',
      'clock',
      'mail',
      'bell',
      'bot',
      'send',
      'flag',
      'play',
      'square',
      'branch',
      'git-branch',
      'alert',
      'warning',
    ];
    for (const name of names) {
      const Icon = resolveWorkflowIcon('trigger', name);
      expect(Icon).toBeDefined();
    }
  });

  it('falls back to kind icon for unknown iconName', () => {
    const Icon = resolveWorkflowIcon('trigger', 'totally-unknown-icon-xyz');
    // Should fall back to the kind's default — not throw
    expect(Icon).toBeDefined();
  });

  it('resolves icons case-insensitively', () => {
    const IconLower = resolveWorkflowIcon('trigger', 'zap');
    const IconUpper = resolveWorkflowIcon('trigger', 'ZAP');
    expect(IconLower).toBe(IconUpper);
  });
});
