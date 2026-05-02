// open/meda/src/workflow-builder/types.ts
import type { Connection, Edge, EdgeChange, Node, NodeChange, ReactFlowProps } from '@xyflow/react';
import type { ReactNode } from 'react';

/**
 * The set of canonical workflow node kinds the package ships custom renderers
 * for. Consumers may also register their own node `type` values via
 * `nodeTypes` / `customNodeTypes` props — these labels are what the bundled
 * toolbox + node renderers cover out-of-the-box.
 */
export type WorkflowNodeKind = 'trigger' | 'action' | 'condition' | 'delay' | 'end';

export interface WorkflowNodeData {
  /** Visible label shown on the node body. */
  label: string;
  /** Canonical kind (drives icon + accent color when no custom renderer). */
  kind: WorkflowNodeKind;
  /** Optional secondary line shown beneath the label. */
  description?: string;
  /** Lucide icon name (free-form string so consumers don't need to import). */
  iconName?: string;
  /** Free-form configuration the consumer attaches to the node. */
  config?: Record<string, unknown>;
  /** Optional state — `error` shows an amber accent. */
  state?: 'default' | 'warning' | 'error';
  // xyflow's Node<TData> requires TData extends Record<string, unknown>; the
  // index signature satisfies that constraint while still surfacing the
  // typed fields above for consumers.
  [key: string]: unknown;
}

export type WorkflowNode = Node<WorkflowNodeData>;
export type WorkflowEdge = Edge;

export interface WorkflowBuilderLabels {
  /** Header bar */
  saveAction: string;
  publishAction: string;
  pauseAction: string;
  saving: string;
  /** Toolbox panel */
  toolboxTitle: string;
  toolboxHint: string;
  toolboxReadOnlyHint: string;
  addTrigger: string;
  addAction: string;
  addCondition: string;
  addDelay: string;
  addEnd: string;
  /** Mobile drawers */
  openToolbox: string;
  openInspector: string;
  closeDrawer: string;
  /** Empty / placeholder state */
  emptyCanvas: string;
}

export const defaultWorkflowBuilderLabels: WorkflowBuilderLabels = {
  saveAction: 'Save',
  publishAction: 'Publish',
  pauseAction: 'Pause',
  saving: 'Saving...',
  toolboxTitle: 'Add step',
  toolboxHint: 'Tap a step to add it to your workflow.',
  toolboxReadOnlyHint: 'This workflow is read-only.',
  addTrigger: 'Trigger',
  addAction: 'Action',
  addCondition: 'Condition',
  addDelay: 'Delay',
  addEnd: 'End',
  openToolbox: 'Steps',
  openInspector: 'Inspector',
  closeDrawer: 'Close',
  emptyCanvas: 'Add a trigger to start building your workflow.',
};

/** Status badge values for the header. */
export type WorkflowStatus = 'draft' | 'active' | 'paused';

export interface WorkflowBuilderProps {
  /** Controlled nodes array. */
  nodes: WorkflowNode[];
  /** Controlled edges array. */
  edges: WorkflowEdge[];
  /** React Flow node-change handler. */
  onNodesChange: (changes: NodeChange[]) => void;
  /** React Flow edge-change handler. */
  onEdgesChange: (changes: EdgeChange[]) => void;
  /** Connection handler. */
  onConnect: (connection: Connection) => void;
  /** Called when a toolbox item is tapped. */
  onAddNode?: (kind: WorkflowNodeKind, position?: { x: number; y: number }) => void;
  /** Selection change forwarded from React Flow. */
  onSelectionChange?: (selection: { nodes: WorkflowNode[]; edges: WorkflowEdge[] }) => void;
  /** Called when a node is clicked (header / inspector trigger). */
  onNodeClick?: (node: WorkflowNode) => void;
  /** Whether the toolbox panel is open by default on desktop (default true). */
  showToolbox?: boolean;
  /** Read-only canvas — disables changes & hides edit affordances. */
  readOnly?: boolean;
  /** Render the header bar slot. When omitted no header is rendered. */
  headerSlot?: ReactNode;
  /** Optional inspector slot (renders inside the right rail / mobile drawer). */
  inspectorSlot?: ReactNode;
  /** Override the default node-types registry. */
  customNodeTypes?: ReactFlowProps['nodeTypes'];
  /** Override the default edge-types registry. */
  customEdgeTypes?: ReactFlowProps['edgeTypes'];
  labels?: Partial<WorkflowBuilderLabels>;
  className?: string;
}

export interface WorkflowToolboxItem {
  kind: WorkflowNodeKind;
  label: string;
  description?: string;
  iconName?: string;
}

export interface WorkflowToolboxProps {
  items?: WorkflowToolboxItem[];
  onAddNode?: (kind: WorkflowNodeKind) => void;
  readOnly?: boolean;
  labels?: Partial<WorkflowBuilderLabels>;
  className?: string;
}

export interface WorkflowHeaderProps {
  name: string;
  onNameChange?: (name: string) => void;
  status?: WorkflowStatus;
  onSave?: () => void;
  onPublish?: () => void;
  onPause?: () => void;
  onBack?: () => void;
  isSaving?: boolean;
  readOnly?: boolean;
  labels?: Partial<WorkflowBuilderLabels>;
  className?: string;
}

export interface WorkflowSummary {
  id: string;
  name: string;
  description?: string;
  status: WorkflowStatus;
  triggerLabel?: string;
  /** Free-form metadata the card surfaces in a footer row. */
  meta?: { label: string; value: string }[];
  /** Avatar URL for the creator (rendered when present). */
  creatorAvatarUrl?: string;
  creatorName?: string;
  /** Unix ms; rendered as relative time when present. */
  createdAt?: number;
}

export interface WorkflowCardProps {
  workflow: WorkflowSummary;
  onClick?: () => void;
  className?: string;
}

export interface WorkflowCardCompactProps extends WorkflowCardProps {
  showStats?: boolean;
}
