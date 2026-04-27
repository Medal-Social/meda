'use client';

import type { ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '../components/ui/command.js';
import { useMedaShell } from './shell-provider.js';
import type { CommandDefinition } from './types.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export const CommandRegistryContext = createContext<CommandRegistry | null>(null);

// ---------------------------------------------------------------------------
// matchesHotkey — strict modifier matching
//
// 'mod+k'          → matches Cmd+K on macOS, Ctrl+K on Windows/Linux
// 'mod+shift+k'    → requires modifier + shift + key; no other modifiers
// 'mod+alt+k'      → requires modifier + alt + key; no other modifiers
//
// Modifiers not listed in `spec` MUST NOT be pressed.
// ---------------------------------------------------------------------------

export function matchesHotkey(e: KeyboardEvent, spec: string): boolean {
  const parts = spec.toLowerCase().split('+');
  const key = parts.at(-1) ?? '';
  const mods = parts.slice(0, -1);

  const wantMod = mods.includes('mod');
  const wantShift = mods.includes('shift');
  const wantAlt = mods.includes('alt');

  const hasMod = e.metaKey || e.ctrlKey;

  return (
    e.key.toLowerCase() === key &&
    (wantMod ? hasMod : !hasMod) &&
    (wantShift ? e.shiftKey : !e.shiftKey) &&
    (wantAlt ? e.altKey : !e.altKey)
  );
}

// ---------------------------------------------------------------------------
// CommandPalette component
// ---------------------------------------------------------------------------

export interface CommandPaletteProps {
  children?: ReactNode;
}

export function CommandPalette({ children }: CommandPaletteProps) {
  const ctx = useMedaShell();
  const { open, setOpen } = ctx.commandPalette;
  const hotkey = ctx.commandPaletteHotkey;

  const [commands, setCommands] = useState<CommandDefinition[]>([]);
  const [groups, setGroups] = useState<CommandGroupDefinition[]>([]);

  // -------------------------------------------------------------------------
  // Registry methods
  // -------------------------------------------------------------------------

  const register = useCallback((cmds: CommandDefinition[]) => {
    setCommands((prev) => {
      const ids = new Set(cmds.map((c) => c.id));
      return [...prev.filter((c) => !ids.has(c.id)), ...cmds];
    });
  }, []);

  const unregister = useCallback((ids: string[]) => {
    setCommands((prev) => prev.filter((c) => !ids.includes(c.id)));
  }, []);

  const registerGroup = useCallback((group: CommandGroupDefinition) => {
    setGroups((prev) => [...prev.filter((g) => g.id !== group.id), group]);
  }, []);

  const unregisterGroup = useCallback((id: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const registry = useMemo(
    () => ({ register, unregister, registerGroup, unregisterGroup }),
    [register, unregister, registerGroup, unregisterGroup]
  );

  // -------------------------------------------------------------------------
  // Hotkey listener
  // -------------------------------------------------------------------------

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (matchesHotkey(e, hotkey)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [hotkey, setOpen]);

  // -------------------------------------------------------------------------
  // Group + sort commands
  // -------------------------------------------------------------------------

  const grouped = useMemo(() => {
    const byGroup = new Map<string, CommandDefinition[]>();
    for (const cmd of commands) {
      const list = byGroup.get(cmd.group) ?? [];
      list.push(cmd);
      byGroup.set(cmd.group, list);
    }

    const orderedGroupIds = [...byGroup.keys()].sort((a, b) => {
      const ga = groups.find((g) => g.id === a);
      const gb = groups.find((g) => g.id === b);
      const pa = ga?.priority ?? 100;
      const pb = gb?.priority ?? 100;
      if (pa !== pb) return pa - pb;
      const la = ga?.label ?? a;
      const lb = gb?.label ?? b;
      return la.localeCompare(lb);
    });

    return orderedGroupIds.map((groupId) => {
      const def = groups.find((g) => g.id === groupId);
      return {
        id: groupId,
        label: def?.label ?? groupId,
        commands: (byGroup.get(groupId) ?? []).sort((a, b) => a.label.localeCompare(b.label)),
      };
    });
  }, [commands, groups]);

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  const handleSelect = (cmd: CommandDefinition) => {
    setOpen(false);
    void cmd.run();
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <CommandRegistryContext.Provider value={registry}>
      {children}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput placeholder="Search commands…" />
          <CommandList>
            <CommandEmpty>No results.</CommandEmpty>
            {grouped.map((group) => (
              <CommandGroup key={group.id} heading={group.label}>
                {group.commands.map((cmd) => {
                  const Icon = cmd.icon;
                  return (
                    <CommandItem
                      key={cmd.id}
                      value={`${group.label} ${cmd.label}`}
                      onSelect={() => handleSelect(cmd)}
                    >
                      {Icon && <Icon size={16} aria-hidden="true" />}
                      <span>{cmd.label}</span>
                      {cmd.shortcut && <CommandShortcut>{cmd.shortcut}</CommandShortcut>}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </CommandRegistryContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// useCommands — registers on mount, unregisters on unmount
// ---------------------------------------------------------------------------

export function useCommands(commands: CommandDefinition[]) {
  const registry = useContext(CommandRegistryContext);
  if (!registry) throw new Error('useCommands must be used inside <CommandPalette>');

  useEffect(() => {
    registry.register(commands);
    return () => registry.unregister(commands.map((c) => c.id));
  }, [commands, registry.register, registry.unregister]);
}

// ---------------------------------------------------------------------------
// useCommandGroup — registers group metadata for ordering
// ---------------------------------------------------------------------------

export function useCommandGroup(group: CommandGroupDefinition) {
  const registry = useContext(CommandRegistryContext);
  if (!registry) throw new Error('useCommandGroup must be used inside <CommandPalette>');

  useEffect(() => {
    registry.registerGroup(group);
    return () => registry.unregisterGroup(group.id);
  }, [group, registry.registerGroup, registry.unregisterGroup]);
}
