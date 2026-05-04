import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WorkflowCanvas } from '../workflow-canvas.js';

describe('WorkflowCanvas', () => {
  it('renders without crashing with empty data', () => {
    const { container } = render(
      <div style={{ width: 800, height: 600 }}>
        <WorkflowCanvas
          nodes={[]}
          edges={[]}
          onNodesChange={() => undefined}
          onEdgesChange={() => undefined}
          onConnect={() => undefined}
        />
      </div>
    );
    expect(container.querySelector('[data-slot="workflow-canvas"]')).toBeInTheDocument();
  });
});
