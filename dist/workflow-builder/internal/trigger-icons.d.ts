import type { ComponentType, ReactNode, SVGProps } from 'react';
import type { WorkflowNodeKind } from '../types.js';
export declare function resolveWorkflowIcon(kind: WorkflowNodeKind, iconName?: string): ComponentType<SVGProps<SVGSVGElement>>;
export declare function renderWorkflowIcon(kind: WorkflowNodeKind, iconName?: string, className?: string): ReactNode;
