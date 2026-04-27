import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { Inspector } from './inspector.js';
import { InspectorField } from './inspector-field.js';
import { InspectorJSON } from './inspector-json.js';

describe('panel a11y', () => {
  it('InspectorField has no axe violations', async () => {
    const { container } = render(<InspectorField label="Voice" value="Rachel" hint="ElevenLabs" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('InspectorJSON has no axe violations', async () => {
    const { container } = render(
      <InspectorJSON data={{ voice: 'Rachel', model: 'claude-opus-4-7' }} />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('Inspector has no axe violations', async () => {
    const { container } = render(
      <Inspector
        tabs={[
          {
            id: 'overview',
            label: 'Overview',
            content: <InspectorField label="Voice" value="Rachel" hint="ElevenLabs" />,
          },
          { id: 'json', label: 'JSON', content: <InspectorJSON data={{ ok: true }} /> },
        ]}
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
