import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import { TurnCard } from './turn-card.js';
const SCROLL_THRESHOLD = 120;
export function TranscriptStream({ turns, autoScroll = true, tz, onTurnPlay, className, }) {
    const ref = useRef(null);
    // Auto-follow last turn when user is near bottom
    // biome-ignore lint/correctness/useExhaustiveDependencies: turns changes trigger scroll check
    useEffect(() => {
        const el = ref.current;
        if (!el || !autoScroll)
            return;
        const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
        if (distanceFromBottom < SCROLL_THRESHOLD) {
            el.scrollTop = el.scrollHeight;
        }
    }, [turns, autoScroll]);
    if (turns.length === 0) {
        return (_jsx("div", { ref: ref, className: [
                'flex flex-1 items-center justify-center text-sm text-muted-foreground',
                className ?? '',
            ].join(' '), children: "No turns yet." }));
    }
    const ref0 = turns[0]?.startedAt ?? 0;
    return (_jsx("div", { ref: ref, className: ['flex-1 overflow-y-auto px-7 pb-6 pt-2', className ?? ''].join(' '), children: turns.map((t) => (_jsx(TurnCard, { turn: t, startedAtRef: ref0, tz: tz, onPlay: onTurnPlay }, t.id))) }));
}
