'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import { getColumnWidths } from '../block-registry.js';
import { BlockRenderer } from '../block-renderer.js';
export function ColumnsBlock({ props, columnChildren, }) {
    const widths = getColumnWidths(props.layout);
    const wrapperStyle = {
        padding: `${props.padding.top}px ${props.padding.right}px ${props.padding.bottom}px ${props.padding.left}px`,
        backgroundColor: props.backgroundColor !== 'transparent' ? props.backgroundColor : undefined,
        display: 'flex',
        flexDirection: props.mobileStacking ? undefined : 'row',
        gap: props.gap,
        alignItems: props.verticalAlignment === 'top'
            ? 'flex-start'
            : props.verticalAlignment === 'middle'
                ? 'center'
                : 'flex-end',
        flexWrap: 'wrap',
    };
    return (_jsx("div", { "data-slot": "email-block-columns", style: wrapperStyle, children: widths.map((w, i) => (_jsx("div", { "data-slot": "email-block-columns-cell", style: {
                flex: `0 0 calc(${w}% - ${(props.gap * (widths.length - 1)) / widths.length}px)`,
                minWidth: 120,
            }, children: (columnChildren?.[i] ?? []).map((b) => (_jsx(BlockRenderer, { block: b }, b.id))) }, i))) }));
}
