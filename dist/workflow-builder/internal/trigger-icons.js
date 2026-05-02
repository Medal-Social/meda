'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { AlertCircle, Bell, Bot, Clock, Flag, GitBranch, Mail, Play, Send, Square, Webhook, Zap, } from 'lucide-react';
/**
 * Resolve a Lucide icon by free-form string. Unknown values fall back to
 * `Zap` so consumers don't have to import lucide just to set an icon.
 */
const ICON_MAP = {
    zap: Zap,
    webhook: Webhook,
    clock: Clock,
    mail: Mail,
    bell: Bell,
    bot: Bot,
    send: Send,
    flag: Flag,
    play: Play,
    square: Square,
    branch: GitBranch,
    'git-branch': GitBranch,
    alert: AlertCircle,
    warning: AlertCircle,
};
/** Default icons per kind; used when the node data omits `iconName`. */
const KIND_ICONS = {
    trigger: Zap,
    action: Send,
    condition: GitBranch,
    delay: Clock,
    end: Flag,
};
export function resolveWorkflowIcon(kind, iconName) {
    if (iconName) {
        const lower = iconName.toLowerCase();
        if (ICON_MAP[lower])
            return ICON_MAP[lower];
    }
    return KIND_ICONS[kind];
}
export function renderWorkflowIcon(kind, iconName, className = 'h-5 w-5') {
    const Icon = resolveWorkflowIcon(kind, iconName);
    return _jsx(Icon, { className: className, "aria-hidden": true });
}
