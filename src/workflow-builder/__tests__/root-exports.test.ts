import { describe, expect, it } from 'vitest';
import * as rootBarrel from '../../index.js';
import * as subBarrel from '../index.js';

describe('workflow-builder root exports', () => {
  it('re-exports key components from the package root', () => {
    expect(rootBarrel.WorkflowBuilder).toBeDefined();
    expect(rootBarrel.WorkflowCanvas).toBeDefined();
    expect(rootBarrel.WorkflowToolbox).toBeDefined();
    expect(rootBarrel.WorkflowHeader).toBeDefined();
    expect(rootBarrel.WorkflowCard).toBeDefined();
    expect(rootBarrel.WorkflowCardCompact).toBeDefined();
    expect(rootBarrel.workflowNodeTypes).toBeDefined();
    expect(rootBarrel.workflowEdgeTypes).toBeDefined();
    expect(rootBarrel.defaultWorkflowBuilderLabels).toBeDefined();
  });

  it('matches the subpath barrel surface', () => {
    for (const name of Object.keys(subBarrel)) {
      expect(rootBarrel).toHaveProperty(name);
    }
  });
});
