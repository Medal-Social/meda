import type { ReactNode } from 'react';

export interface InspectorTab {
  id: string;
  label: string;
  content: ReactNode;
}
