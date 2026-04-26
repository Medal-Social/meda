import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import { TurnCard } from './turn-card.js';
const SCROLL_THRESHOLD = 120;
export function TranscriptStream({ turns, autoScroll = true, tz, onTurnPlay, className, }) {
    const ref = useRef(null);
    // Snapshot of "was the user near the bottom?" sampled BEFORE the new turn
    // renders, so that a tall appended turn doesn't push the bottom off-screen
    // and falsely look like the user scrolled away.
    const wasAtBottomRef = useRef(true);
    useEffect(() => {
        const el = ref.current;
        if (!el)
            return;
        const onScroll = () => {
            const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
            wasAtBottomRef.current = distanceFromBottom < SCROLL_THRESHOLD;
        };
        el.addEventListener('scroll', onScroll, { passive: true });
        return () => el.removeEventListener('scroll', onScroll);
    }, []);
    // Auto-follow last turn when the user was near the bottom before the new turn appended.
    // biome-ignore lint/correctness/useExhaustiveDependencies: turns changes trigger scroll check
    useEffect(() => {
        const el = ref.current;
        if (!el || !autoScroll)
            return;
        if (wasAtBottomRef.current) {
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
