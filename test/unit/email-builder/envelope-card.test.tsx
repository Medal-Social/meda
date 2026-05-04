import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EnvelopeCard } from '../envelope-card.js';
import type { EmailEnvelope } from '../types.js';

describe('EnvelopeCard', () => {
  it('renders all fields', () => {
    render(<EnvelopeCard envelope={undefined} onChange={() => {}} />);
    expect(screen.getByLabelText('Subject')).toBeInTheDocument();
    expect(screen.getByLabelText('From name')).toBeInTheDocument();
    expect(screen.getByLabelText('From email')).toBeInTheDocument();
    expect(screen.getByLabelText('Reply-to')).toBeInTheDocument();
    expect(screen.getByLabelText('Preheader')).toBeInTheDocument();
  });

  it('populates fields from the envelope prop', () => {
    const envelope: EmailEnvelope = {
      subject: 'Hello',
      fromName: 'Acme',
      fromEmail: 'hi@acme.com',
      replyTo: 'reply@acme.com',
      preheader: 'preview text',
    };
    render(<EnvelopeCard envelope={envelope} onChange={() => {}} />);
    expect(screen.getByLabelText('Subject')).toHaveValue('Hello');
    expect(screen.getByLabelText('From name')).toHaveValue('Acme');
    expect(screen.getByLabelText('From email')).toHaveValue('hi@acme.com');
    expect(screen.getByLabelText('Reply-to')).toHaveValue('reply@acme.com');
    expect(screen.getByLabelText('Preheader')).toHaveValue('preview text');
  });

  it('uses empty strings when envelope is undefined', () => {
    render(<EnvelopeCard envelope={undefined} onChange={() => {}} />);
    expect(screen.getByLabelText('Subject')).toHaveValue('');
    expect(screen.getByLabelText('From name')).toHaveValue('');
  });

  it('calls onChange with updated subject', () => {
    const onChange = vi.fn();
    render(<EnvelopeCard envelope={{}} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Subject'), { target: { value: 'New subject' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ subject: 'New subject' }));
  });

  it('calls onChange with updated fromName', () => {
    const onChange = vi.fn();
    render(<EnvelopeCard envelope={{}} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('From name'), { target: { value: 'Acme Inc' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ fromName: 'Acme Inc' }));
  });

  it('calls onChange with updated fromEmail', () => {
    const onChange = vi.fn();
    render(<EnvelopeCard envelope={{}} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('From email'), { target: { value: 'hi@acme.com' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ fromEmail: 'hi@acme.com' }));
  });

  it('calls onChange with updated replyTo', () => {
    const onChange = vi.fn();
    render(<EnvelopeCard envelope={{}} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Reply-to'), { target: { value: 'reply@acme.com' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ replyTo: 'reply@acme.com' }));
  });

  it('calls onChange with updated preheader', () => {
    const onChange = vi.fn();
    render(<EnvelopeCard envelope={{}} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Preheader'), { target: { value: 'preview' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ preheader: 'preview' }));
  });

  it('merges patch with existing envelope fields', () => {
    const onChange = vi.fn();
    const envelope: EmailEnvelope = { subject: 'Existing', fromName: 'Bob' };
    render(<EnvelopeCard envelope={envelope} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Subject'), { target: { value: 'New' } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ subject: 'New', fromName: 'Bob' })
    );
  });
});
