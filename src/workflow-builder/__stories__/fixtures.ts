// open/meda/src/workflow-builder/__stories__/fixtures.ts
import type { WorkflowEdge, WorkflowNode, WorkflowSummary } from '../types.js';

export const SAMPLE_NODES: WorkflowNode[] = [
  {
    id: 'n1',
    type: 'trigger',
    position: { x: 0, y: 0 },
    data: { label: 'New contact', kind: 'trigger', iconName: 'zap' },
  },
  {
    id: 'n2',
    type: 'condition',
    position: { x: 0, y: 160 },
    data: { label: 'Is VIP?', kind: 'condition', iconName: 'git-branch' },
  },
  {
    id: 'n3',
    type: 'action',
    position: { x: -160, y: 320 },
    data: { label: 'Send welcome email', kind: 'action', iconName: 'mail' },
  },
  {
    id: 'n4',
    type: 'delay',
    position: { x: 160, y: 320 },
    data: { label: 'Wait 1 day', kind: 'delay', iconName: 'clock' },
  },
  {
    id: 'n5',
    type: 'end',
    position: { x: 0, y: 480 },
    data: { label: 'Done', kind: 'end', iconName: 'flag' },
  },
];

export const SAMPLE_EDGES: WorkflowEdge[] = [
  { id: 'e1', source: 'n1', target: 'n2' },
  { id: 'e2', source: 'n2', sourceHandle: 'true', target: 'n3' },
  { id: 'e3', source: 'n2', sourceHandle: 'false', target: 'n4' },
  { id: 'e4', source: 'n3', target: 'n5' },
  { id: 'e5', source: 'n4', target: 'n5' },
];

export const SAMPLE_WORKFLOWS: WorkflowSummary[] = [
  {
    id: 'wf1',
    name: 'Welcome flow',
    description: 'Onboard new contacts with a 3-step welcome sequence.',
    status: 'active',
    triggerLabel: 'Contact created',
    meta: [
      { label: 'Enrolled', value: '124' },
      { label: 'Sent', value: '372' },
    ],
    creatorName: 'Ali Lloyd',
    createdAt: Date.now() - 1000 * 60 * 60 * 26,
  },
  {
    id: 'wf2',
    name: 'Lead nurture',
    description: 'Drip campaign for cold leads.',
    status: 'paused',
    triggerLabel: 'Label added',
    creatorName: 'Sam Chen',
    createdAt: Date.now() - 1000 * 60 * 90,
  },
];
