import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BASE_FIXTURE } from '../__stories__/fixtures.js';
import { InstagramPreview, TwitterPreview } from '../index.js';

describe('post-preview labels override', () => {
  it('Instagram uses provided labels when supplied', () => {
    render(
      <InstagramPreview
        {...BASE_FIXTURE}
        mediaUrls={[BASE_FIXTURE.avatarUrl ?? '']}
        labels={{ like: 'Vota', comment: 'Commenta', share: 'Condividi', save: 'Salva' }}
      />
    );
    expect(screen.getByLabelText('Vota')).toBeInTheDocument();
    expect(screen.getByLabelText('Commenta')).toBeInTheDocument();
    expect(screen.getByLabelText('Condividi')).toBeInTheDocument();
    expect(screen.getByLabelText('Salva')).toBeInTheDocument();
  });

  it('Twitter falls back to defaults when only some labels are provided', () => {
    render(<TwitterPreview {...BASE_FIXTURE} labels={{ share: 'Compartir' }} />);
    expect(screen.getByLabelText('Compartir')).toBeInTheDocument();
    // 'Save' default still present
    expect(screen.getByLabelText('Save')).toBeInTheDocument();
  });
});
