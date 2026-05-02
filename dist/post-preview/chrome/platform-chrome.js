import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../../lib/utils.js';
/**
 * Base chrome wrapper. Per-platform chromes (e.g. `InstagramChrome`)
 * compose this with their own header / tab bar / brand color.
 *
 * Ported from `apps/web/src/components/composer/previews/chrome/platform-chrome.tsx`.
 */
export function PlatformChrome({ children, platform, className, showPhoneFrame = false, }) {
    if (showPhoneFrame) {
        return (_jsxs("section", { "data-slot": "post-preview-chrome", "data-phone-frame": "true", "aria-label": `${platform} preview`, className: cn('relative mx-auto max-w-[375px]', 'rounded-[3rem] border-[14px] border-gray-900 bg-gray-900', 'shadow-xl', className), children: [_jsx("div", { "aria-hidden": true, className: "-translate-x-1/2 absolute top-0 left-1/2 z-10 h-[30px] w-[120px] rounded-b-2xl bg-gray-900" }), _jsxs("div", { className: "relative overflow-hidden rounded-[2.2rem] bg-white", children: [_jsx(PhoneStatusBar, {}), children, _jsx("div", { "aria-hidden": true, className: "-translate-x-1/2 absolute bottom-2 left-1/2 h-[5px] w-[134px] rounded-full bg-gray-900" })] })] }));
    }
    return (_jsx("section", { "data-slot": "post-preview-chrome", "aria-label": `${platform} preview`, className: cn('overflow-hidden rounded-lg shadow-lg', className), children: children }));
}
export function PhoneStatusBar() {
    return (_jsxs("div", { className: "absolute top-[30px] right-0 left-0 z-10 flex items-center justify-between bg-transparent px-6 py-2 text-gray-900", children: [_jsx("span", { className: "font-semibold text-[14px]", children: "9:41" }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsxs("svg", { className: "h-4 w-4", viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true", children: [_jsx("rect", { x: "1", y: "14", width: "4", height: "8", rx: "1" }), _jsx("rect", { x: "7", y: "10", width: "4", height: "12", rx: "1" }), _jsx("rect", { x: "13", y: "6", width: "4", height: "16", rx: "1" }), _jsx("rect", { x: "19", y: "2", width: "4", height: "20", rx: "1" })] }), _jsx("svg", { className: "h-4 w-4", viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true", children: _jsx("path", { d: "M12 3C7.03 3 2.47 5.19 0 9l2.5 2.5C4.49 8.92 8.03 7 12 7s7.51 1.92 9.5 4.5L24 9c-2.47-3.81-7.03-6-12-6zm0 6c-3.03 0-5.78 1.23-7.78 3.22L6.5 14.5C7.87 13.07 9.84 12 12 12s4.13 1.07 5.5 2.5l2.28-2.28C17.78 10.23 15.03 9 12 9zm0 6c-1.65 0-3.14.62-4.28 1.63L12 21l4.28-4.37C15.14 15.62 13.65 15 12 15z" }) }), _jsxs("svg", { className: "h-4 w-6", viewBox: "0 0 28 14", fill: "currentColor", "aria-hidden": "true", children: [_jsx("rect", { x: "0", y: "0", width: "24", height: "14", rx: "3", stroke: "currentColor", strokeWidth: "1", fill: "none" }), _jsx("rect", { x: "25", y: "4", width: "3", height: "6", rx: "1" }), _jsx("rect", { x: "2", y: "2", width: "19", height: "10", rx: "1.5" })] })] })] }));
}
