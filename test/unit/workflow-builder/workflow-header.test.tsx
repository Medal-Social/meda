import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { WorkflowHeader } from '../../../src/workflow-builder/workflow-header.js';

describe('WorkflowHeader', () => {
  it('renders name and status', () => {
    render(<WorkflowHeader name="My flow" status="active" />);
    expect(screen.getByText('My flow')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('calls onSave when Save is clicked', () => {
    const onSave = vi.fn();
    render(<WorkflowHeader name="Flow" onSave={onSave} />);
    fireEvent.click(screen.getByText('Save'));
    expect(onSave).toHaveBeenCalled();
  });

  it('shows Pause when status is active', () => {
    const onPause = vi.fn();
    render(<WorkflowHeader name="Flow" status="active" onPause={onPause} />);
    fireEvent.click(screen.getByText('Pause'));
    expect(onPause).toHaveBeenCalled();
  });

  it('hides actions in readOnly mode', () => {
    render(<WorkflowHeader name="Flow" status="active" onSave={() => undefined} readOnly />);
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
  });

  it('respects custom labels', () => {
    render(
      <WorkflowHeader name="Flow" onSave={() => undefined} labels={{ saveAction: 'Persist' }} />
    );
    expect(screen.getByText('Persist')).toBeInTheDocument();
  });

  it('shows Publish button when status is draft and onPublish provided', () => {
    const onPublish = vi.fn();
    render(<WorkflowHeader name="Flow" status="draft" onPublish={onPublish} />);
    fireEvent.click(screen.getByText('Publish'));
    expect(onPublish).toHaveBeenCalled();
  });

  it('shows Publish button when status is paused and onPublish provided', () => {
    const onPublish = vi.fn();
    render(<WorkflowHeader name="Flow" status="paused" onPublish={onPublish} />);
    fireEvent.click(screen.getByText('Publish'));
    expect(onPublish).toHaveBeenCalled();
  });

  it('shows Paused status badge', () => {
    render(<WorkflowHeader name="Flow" status="paused" />);
    expect(screen.getByText('Paused')).toBeInTheDocument();
  });

  it('shows Draft status badge', () => {
    render(<WorkflowHeader name="Flow" status="draft" />);
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  it('shows Saving... label when isSaving is true', () => {
    render(<WorkflowHeader name="Flow" onSave={() => undefined} isSaving />);
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('calls onBack when back button is clicked', () => {
    const onBack = vi.fn();
    render(<WorkflowHeader name="Flow" onBack={onBack} />);
    fireEvent.click(screen.getByLabelText('Back'));
    expect(onBack).toHaveBeenCalled();
  });

  it('renders "Untitled workflow" when name is empty', () => {
    render(<WorkflowHeader name="" />);
    expect(screen.getByText('Untitled workflow')).toBeInTheDocument();
  });

  it('enters name edit mode on click when onNameChange provided', async () => {
    const onNameChange = vi.fn();
    render(<WorkflowHeader name="My flow" onNameChange={onNameChange} />);
    const nameButton = screen.getByText('My flow');
    fireEvent.click(nameButton);
    // After click, an input should appear
    const input = document.querySelector('input');
    expect(input).toBeInTheDocument();
  });

  it('calls onNameChange when input changes', () => {
    const onNameChange = vi.fn();
    render(<WorkflowHeader name="My flow" onNameChange={onNameChange} />);
    fireEvent.click(screen.getByText('My flow'));
    const input = document.querySelector('input');
    if (!input) throw new Error('input not found');
    fireEvent.change(input, { target: { value: 'New name' } });
    expect(onNameChange).toHaveBeenCalledWith('New name');
  });

  it('exits edit mode on blur', () => {
    const onNameChange = vi.fn();
    render(<WorkflowHeader name="My flow" onNameChange={onNameChange} />);
    fireEvent.click(screen.getByText('My flow'));
    const input = document.querySelector('input');
    if (!input) throw new Error('input not found');
    fireEvent.blur(input);
    expect(document.querySelector('input')).not.toBeInTheDocument();
  });

  it('exits edit mode on Enter keydown', () => {
    const onNameChange = vi.fn();
    render(<WorkflowHeader name="My flow" onNameChange={onNameChange} />);
    fireEvent.click(screen.getByText('My flow'));
    const input = document.querySelector('input');
    if (!input) throw new Error('input not found');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(document.querySelector('input')).not.toBeInTheDocument();
  });

  it('exits edit mode on Escape keydown', () => {
    const onNameChange = vi.fn();
    render(<WorkflowHeader name="My flow" onNameChange={onNameChange} />);
    fireEvent.click(screen.getByText('My flow'));
    const input = document.querySelector('input');
    if (!input) throw new Error('input not found');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(document.querySelector('input')).not.toBeInTheDocument();
  });

  it('other keydown in edit mode does not exit edit mode', () => {
    const onNameChange = vi.fn();
    render(<WorkflowHeader name="My flow" onNameChange={onNameChange} />);
    fireEvent.click(screen.getByText('My flow'));
    const input = document.querySelector('input');
    if (!input) throw new Error('input not found');
    fireEvent.keyDown(input, { key: 'a' });
    // Input should still be present (edit mode not exited)
    expect(document.querySelector('input')).toBeInTheDocument();
  });

  it('does not enter edit mode when readOnly', () => {
    const onNameChange = vi.fn();
    render(<WorkflowHeader name="My flow" onNameChange={onNameChange} readOnly />);
    // The button is disabled; use a raw click event on the element to invoke handleNameClick
    const btn = document.querySelector('button[disabled]');
    if (btn) fireEvent.click(btn);
    expect(document.querySelector('input')).not.toBeInTheDocument();
  });

  it('does not enter edit mode when onNameChange is not provided', () => {
    render(<WorkflowHeader name="My flow" />);
    // The button is disabled; force click it to exercise the early return guard
    const btn = document.querySelector('button[disabled]');
    if (btn) fireEvent.click(btn);
    expect(document.querySelector('input')).not.toBeInTheDocument();
  });
});
