import type { PostPreviewBaseProps } from '../types.js';

export const FIXTURE_AVATAR =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces';

export const FIXTURE_MEDIA = {
  square: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=800&fit=crop',
  landscape: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&h=675&fit=crop',
  portrait: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=720&h=1280&fit=crop',
};

export const BASE_FIXTURE: PostPreviewBaseProps = {
  displayName: 'Acme Studios',
  username: 'acmestudios',
  avatarUrl: FIXTURE_AVATAR,
  content:
    'Just shipped a new platform integration — three months of work, finally live. ' +
    'Try it out and let us know what you think! #launch #shipit',
};
