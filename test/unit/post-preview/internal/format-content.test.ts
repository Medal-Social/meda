import { describe, expect, it } from 'vitest';
import { splitContent } from '../../../../src/post-preview/internal/format-content.js';

describe('splitContent', () => {
  it('returns a single text part when nothing is special', () => {
    expect(splitContent('hello world')).toEqual([{ type: 'text', value: 'hello world' }]);
  });

  it('splits @mentions from text', () => {
    expect(splitContent('hi @alice and @bob_smith')).toEqual([
      { type: 'text', value: 'hi ' },
      { type: 'mention', value: '@alice' },
      { type: 'text', value: ' and ' },
      { type: 'mention', value: '@bob_smith' },
    ]);
  });

  it('splits #hashtags from text', () => {
    expect(splitContent('check out #launch_day')).toEqual([
      { type: 'text', value: 'check out ' },
      { type: 'hashtag', value: '#launch_day' },
    ]);
  });

  it('splits http(s) URLs from text', () => {
    expect(splitContent('see https://example.com/path now')).toEqual([
      { type: 'text', value: 'see ' },
      { type: 'url', value: 'https://example.com/path' },
      { type: 'text', value: ' now' },
    ]);
  });

  it('handles empty string', () => {
    expect(splitContent('')).toEqual([]);
  });
});
