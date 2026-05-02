'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ArrowLeft, Pause, Play, Save } from 'lucide-react';
import { useRef, useState } from 'react';
import { cn } from '../lib/utils.js';
import { defaultWorkflowBuilderLabels, } from './types.js';
const STATUS_CLASSES = {
    draft: 'bg-muted text-muted-foreground',
    active: 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400',
    paused: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400',
};
const STATUS_TEXT = {
    draft: 'Draft',
    active: 'Active',
    paused: 'Paused',
};
export function WorkflowHeader({ name, onNameChange, status = 'draft', onSave, onPublish, onPause, onBack, isSaving = false, readOnly = false, labels, className, }) {
    const resolvedLabels = { ...defaultWorkflowBuilderLabels, ...(labels ?? {}) };
    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef(null);
    const handleNameClick = () => {
        if (readOnly || !onNameChange)
            return;
        setIsEditing(true);
        setTimeout(() => inputRef.current?.select(), 0);
    };
    return (_jsxs("header", { "data-slot": "workflow-header", className: cn('flex h-14 items-center justify-between border-border border-b bg-background px-4', className), children: [_jsxs("div", { className: "flex min-w-0 items-center gap-3", children: [onBack ? (_jsx("button", { type: "button", onClick: onBack, "aria-label": "Back", className: "inline-flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground", children: _jsx(ArrowLeft, { className: "h-4 w-4", "aria-hidden": true }) })) : null, isEditing && onNameChange ? (_jsx("input", { ref: inputRef, value: name, onChange: (e) => onNameChange(e.target.value), onBlur: () => setIsEditing(false), onKeyDown: (e) => {
                            if (e.key === 'Enter' || e.key === 'Escape')
                                setIsEditing(false);
                        }, className: "h-9 w-64 rounded-md border border-border bg-background px-2 font-semibold text-foreground text-sm" })) : (_jsx("button", { type: "button", onClick: handleNameClick, disabled: readOnly || !onNameChange, className: "rounded-md px-2 py-1 font-semibold text-foreground text-sm transition-colors hover:bg-accent disabled:cursor-default disabled:hover:bg-transparent", children: name || 'Untitled workflow' })), _jsx("span", { "data-slot": "workflow-status-badge", className: cn('inline-flex items-center rounded-full px-2 py-0.5 font-medium text-xs', STATUS_CLASSES[status]), children: STATUS_TEXT[status] })] }), !readOnly ? (_jsxs("div", { className: "flex items-center gap-2", children: [(status === 'draft' || status === 'paused') && onPublish ? (_jsxs("button", { type: "button", onClick: onPublish, className: "inline-flex h-9 min-h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 font-medium text-sm transition-colors hover:bg-accent", children: [_jsx(Play, { className: "h-3.5 w-3.5", "aria-hidden": true }), resolvedLabels.publishAction] })) : null, status === 'active' && onPause ? (_jsxs("button", { type: "button", onClick: onPause, className: "inline-flex h-9 min-h-9 items-center gap-1.5 rounded-md border border-border bg-background px-3 font-medium text-sm transition-colors hover:bg-accent", children: [_jsx(Pause, { className: "h-3.5 w-3.5", "aria-hidden": true }), resolvedLabels.pauseAction] })) : null, onSave ? (_jsxs("button", { type: "button", onClick: onSave, disabled: isSaving, className: "inline-flex h-9 min-h-9 items-center gap-1.5 rounded-md bg-primary px-3 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90 disabled:opacity-50", children: [_jsx(Save, { className: "h-3.5 w-3.5", "aria-hidden": true }), isSaving ? resolvedLabels.saving : resolvedLabels.saveAction] })) : null] })) : null] }));
}
