import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BASE_FIXTURE } from '../__stories__/fixtures.js';
import { TwitterPreview } from '../platforms/index.js';

describe('post-preview editable mode', () => {
  it('renders a textbox when editable is true', () => {
    render(<TwitterPreview {...BASE_FIXTURE} editable />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('does not render a textbox when editable is false', () => {
    render(<TwitterPreview {...BASE_FIXTURE} />);
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('fires onContentChange when the user edits the textbox', () => {
    const onContentChange = vi.fn();
    render(
      <TwitterPreview {...BASE_FIXTURE} editable onContentChange={onContentChange} content="" />
    );
    const textbox = screen.getByRole('textbox');
    fireEvent.change(textbox, { target: { value: 'abc' } });
    expect(onContentChange).toHaveBeenCalledWith('abc');
  });

  it('shows a character counter when characterLimit is set', () => {
    render(<TwitterPreview {...BASE_FIXTURE} editable content="hello" characterLimit={280} />);
    expect(screen.getByText(/280/)).toBeInTheDocument();
    expect(screen.getByText(/275/)).toBeInTheDocument(); // remaining
  });
});
