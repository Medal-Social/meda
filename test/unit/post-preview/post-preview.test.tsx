import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PostPreview } from '../../../src/post-preview/post-preview.js';

const baseProps = {
  displayName: 'Acme',
  username: 'acme',
  content: 'Hello world',
};

describe('PostPreview', () => {
  it('renders the Instagram preview when platform="instagram"', () => {
    render(<PostPreview platform="instagram" {...baseProps} />);
    expect(screen.getByRole('button', { name: /like/i })).toBeInTheDocument();
  });

  it('renders the Twitter preview when platform="twitter"', () => {
    render(<PostPreview platform="twitter" {...baseProps} />);
    expect(screen.getByRole('button', { name: /reply/i })).toBeInTheDocument();
  });

  it('renders the Generic preview when platform="generic"', () => {
    render(<PostPreview platform="generic" {...baseProps} />);
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('treats mode="edit" as editable=true', () => {
    const onContentChange = (): void => {};
    render(
      <PostPreview
        platform="generic"
        {...baseProps}
        mode="edit"
        onContentChange={onContentChange}
      />
    );
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.value).toBe('Hello world');
  });

  it('renders the renderEditor slot when provided in edit mode', () => {
    render(
      <PostPreview
        platform="generic"
        {...baseProps}
        mode="edit"
        renderEditor={({ value }) => <div data-testid="custom-editor">{value}</div>}
      />
    );
    expect(screen.getByTestId('custom-editor')).toHaveTextContent('Hello world');
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('renders renderMediaPicker / renderEmojiPicker / renderMentionPicker triggers in edit mode', () => {
    render(
      <PostPreview
        platform="generic"
        {...baseProps}
        mode="edit"
        renderMediaPicker={() => <button type="button">Pick media</button>}
        renderEmojiPicker={() => <button type="button">Pick emoji</button>}
        renderMentionPicker={() => <button type="button">Pick mention</button>}
      />
    );
    expect(screen.getByRole('button', { name: 'Pick media' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pick emoji' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pick mention' })).toBeInTheDocument();
  });

  it('does not render the edit toolbar when mode is preview', () => {
    render(
      <PostPreview
        platform="generic"
        {...baseProps}
        renderEmojiPicker={() => <button type="button">Pick emoji</button>}
      />
    );
    expect(screen.queryByRole('button', { name: 'Pick emoji' })).not.toBeInTheDocument();
  });
});
