import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { InspectorField } from './inspector-field.js';

describe('InspectorField', () => {
  it('renders label and value', () => {
    render(<InspectorField label="Voice" value="Rachel" />);
    expect(screen.getByText('Voice')).toBeInTheDocument();
    expect(screen.getByText('Rachel')).toBeInTheDocument();
  });

  it('renders hint when provided', () => {
    render(<InspectorField label="Voice" value="Rachel" hint="ElevenLabs Turbo v2" />);
    expect(screen.getByText('ElevenLabs Turbo v2')).toBeInTheDocument();
  });

  it('uppercases the label', () => {
    const { container } = render(<InspectorField label="Voice" value="Rachel" />);
    const label = container.querySelector('.uppercase');
    expect(label).toHaveTextContent('Voice');
  });
});
