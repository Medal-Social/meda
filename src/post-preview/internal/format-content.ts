export type ContentPartType = 'text' | 'mention' | 'hashtag' | 'url';

export interface ContentPart {
  type: ContentPartType;
  value: string;
}

const PATTERN = /(@[A-Za-z0-9_]+|#[A-Za-z0-9_]+|https?:\/\/\S+)/g;

/**
 * Split a content string into typed parts so platform components can
 * apply per-platform styling for mentions, hashtags, and URLs.
 *
 * Empty strings return an empty array (callers can render nothing).
 */
export function splitContent(content: string): ContentPart[] {
  if (!content) return [];
  const parts: ContentPart[] = [];
  let lastIndex = 0;
  for (const match of content.matchAll(PATTERN)) {
    /* v8 ignore next — match.index is always defined for matchAll results */
    const matchIndex = match.index ?? 0;
    if (matchIndex > lastIndex) {
      parts.push({ type: 'text', value: content.slice(lastIndex, matchIndex) });
    }
    const value = match[0];
    if (value.startsWith('@')) parts.push({ type: 'mention', value });
    else if (value.startsWith('#')) parts.push({ type: 'hashtag', value });
    else parts.push({ type: 'url', value });
    lastIndex = matchIndex + value.length;
  }
  if (lastIndex < content.length) {
    parts.push({ type: 'text', value: content.slice(lastIndex) });
  }
  return parts;
}
