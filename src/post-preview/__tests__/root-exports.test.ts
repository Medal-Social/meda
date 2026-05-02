import { describe, expect, it } from 'vitest';
import * as Root from '../../index.js';
import * as Subpath from '../index.js';

const EXPECTED_PREVIEWS = [
  'BlueSkyPreview',
  'DiscordPreview',
  'FacebookPreview',
  'GenericPreview',
  'GoogleBusinessPreview',
  'InstagramPreview',
  'LinkedInPreview',
  'TelegramPreview',
  'ThreadsPreview',
  'TikTokPreview',
  'TwitterPreview',
  'YouTubePreview',
] as const;

const EXPECTED_CHROMES = [
  'BlueSkyChrome',
  'DiscordChrome',
  'FacebookChrome',
  'GoogleBusinessChrome',
  'InstagramChrome',
  'LinkedInChrome',
  'PlatformChrome',
  'TelegramChrome',
  'ThreadsChrome',
  'TikTokChrome',
  'TwitterChrome',
  'YouTubeChrome',
] as const;

describe('post-preview public exports', () => {
  for (const name of EXPECTED_PREVIEWS) {
    it(`subpath exports ${name}`, () => {
      expect((Subpath as Record<string, unknown>)[name]).toBeTypeOf('function');
    });
    it(`root exports ${name}`, () => {
      expect((Root as Record<string, unknown>)[name]).toBeTypeOf('function');
    });
  }
  for (const name of EXPECTED_CHROMES) {
    it(`subpath exports ${name}`, () => {
      expect((Subpath as Record<string, unknown>)[name]).toBeTypeOf('function');
    });
  }
});
