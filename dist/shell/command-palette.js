'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandShortcut, } from '../components/ui/command.js';
import { useMedaShell } from './shell-provider.js';
// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
export const CommandRegistryContext = createContext(null);
// ---------------------------------------------------------------------------
// matchesHotkey — strict modifier matching
//
// 'mod+k'          → matches Cmd+K on macOS, Ctrl+K on Windows/Linux
// 'mod+shift+k'    → requires modifier + shift + key; no other modifiers
// 'mod+alt+k'      → requires modifier + alt + key; no other modifiers
//
// Modifiers not listed in `spec` MUST NOT be pressed.
// ---------------------------------------------------------------------------
export function matchesHotkey(e, spec) {
    const parts = spec.toLowerCase().split('+');
    const key = parts.at(-1) ?? '';
    const mods = parts.slice(0, -1);
    const wantMod = mods.includes('mod');
    const wantShift = mods.includes('shift');
    const wantAlt = mods.includes('alt');
    const hasMod = e.metaKey || e.ctrlKey;
    return (e.key.toLowerCase() === key &&
        (wantMod ? hasMod : !hasMod) &&
        (wantShift ? e.shiftKey : !e.shiftKey) &&
        (wantAlt ? e.altKey : !e.altKey));
}
export function CommandPalette({ children }) {
    const ctx = useMedaShell();
    const { open, setOpen } = ctx.commandPalette;
    const hotkey = ctx.commandPaletteHotkey;
    const [commands, setCommands] = useState([]);
    const [groups, setGroups] = useState([]);
    // -------------------------------------------------------------------------
    // Registry methods
    // -------------------------------------------------------------------------
    const register = useCallback((cmds) => {
        setCommands((prev) => {
            const ids = new Set(cmds.map((c) => c.id));
            return [...prev.filter((c) => !ids.has(c.id)), ...cmds];
        });
    }, []);
    const unregister = useCallback((ids) => {
        setCommands((prev) => prev.filter((c) => !ids.includes(c.id)));
    }, []);
    const registerGroup = useCallback((group) => {
        setGroups((prev) => [...prev.filter((g) => g.id !== group.id), group]);
    }, []);
    const unregisterGroup = useCallback((id) => {
        setGroups((prev) => prev.filter((g) => g.id !== id));
    }, []);
    const registry = useMemo(() => ({ register, unregister, registerGroup, unregisterGroup }), [register, unregister, registerGroup, unregisterGroup]);
    // -------------------------------------------------------------------------
    // Hotkey listener
    // -------------------------------------------------------------------------
    useEffect(() => {
        const onKey = (e) => {
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
        const byGroup = new Map();
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
            if (pa !== pb)
                return pa - pb;
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
    const handleSelect = (cmd) => {
        setOpen(false);
        void cmd.run();
    };
    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------
    return (_jsxs(CommandRegistryContext.Provider, { value: registry, children: [children, _jsx(CommandDialog, { open: open, onOpenChange: setOpen, children: _jsxs(Command, { children: [_jsx(CommandInput, { placeholder: "Search commands\u2026" }), _jsxs(CommandList, { children: [_jsx(CommandEmpty, { children: "No results." }), grouped.map((group) => (_jsx(CommandGroup, { heading: group.label, children: group.commands.map((cmd) => {
                                        const Icon = cmd.icon;
                                        return (_jsxs(CommandItem, { value: `${group.label} ${cmd.label}`, onSelect: () => handleSelect(cmd), children: [Icon && _jsx(Icon, { size: 16, "aria-hidden": "true" }), _jsx("span", { children: cmd.label }), cmd.shortcut && _jsx(CommandShortcut, { children: cmd.shortcut })] }, cmd.id));
                                    }) }, group.id)))] })] }) })] }));
}
// ---------------------------------------------------------------------------
// useCommands — registers on mount, unregisters on unmount
// ---------------------------------------------------------------------------
export function useCommands(commands) {
    const registry = useContext(CommandRegistryContext);
    if (!registry)
        throw new Error('useCommands must be used inside <CommandPalette>');
    useEffect(() => {
        registry.register(commands);
        return () => registry.unregister(commands.map((c) => c.id));
    }, [commands, registry.register, registry.unregister]);
}
// ---------------------------------------------------------------------------
// useCommandGroup — registers group metadata for ordering
// ---------------------------------------------------------------------------
export function useCommandGroup(group) {
    const registry = useContext(CommandRegistryContext);
    if (!registry)
        throw new Error('useCommandGroup must be used inside <CommandPalette>');
    useEffect(() => {
        registry.registerGroup(group);
        return () => registry.unregisterGroup(group.id);
    }, [group, registry.registerGroup, registry.unregisterGroup]);
}
