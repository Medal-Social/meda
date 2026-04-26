import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const PHASE_LABEL = {
    idle: 'Idle',
    listening: 'Listening',
    thinking: 'Thinking',
    speaking: 'Speaking',
    error: 'Error',
};
export function VoiceStatusPill({ phase, thinkingForMs, className }) {
    const tone = phase === 'listening'
        ? 'bg-primary text-primary-foreground'
        : phase === 'speaking'
            ? 'bg-emerald-500 text-white'
            : phase === 'error'
                ? 'bg-destructive text-destructive-foreground'
                : 'bg-muted text-muted-foreground';
    const seconds = thinkingForMs ? (thinkingForMs / 1000).toFixed(1) : null;
    return (_jsxs("span", { role: "status", "data-phase": phase, className: [
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
            tone,
            className ?? '',
        ].join(' '), children: [_jsx("span", { className: [
                    'size-1.5 rounded-full bg-current',
                    phase === 'thinking' ? 'animate-pulse' : '',
                ].join(' ') }), PHASE_LABEL[phase], phase === 'thinking' && seconds && _jsxs("span", { className: "opacity-70", children: ["\u00B7 ", seconds, "s"] })] }));
}
