import type { ReactNode } from 'react';
import type { CommandDefinition } from './types.js';
export interface CommandGroupDefinition {
    id: string;
    label: string;
    /** Lower value = rendered earlier. Default: 100. */
    priority?: number;
}
interface CommandRegistry {
    register: (commands: CommandDefinition[]) => void;
    unregister: (ids: string[]) => void;
    registerGroup: (group: CommandGroupDefinition) => void;
    unregisterGroup: (id: string) => void;
}
export declare const CommandRegistryContext: import("react").Context<CommandRegistry | null>;
export declare function matchesHotkey(e: KeyboardEvent, spec: string): boolean;
export interface CommandPaletteProps {
    children?: ReactNode;
}
export declare function CommandPalette({ children }: CommandPaletteProps): import("react/jsx-runtime").JSX.Element;
export declare function useCommands(commands: CommandDefinition[]): void;
export declare function useCommandGroup(group: CommandGroupDefinition): void;
export {};
