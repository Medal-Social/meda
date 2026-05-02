import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Bell, Home, Menu, Search, Store, Tv, Users } from 'lucide-react';
import { cn } from '../../lib/utils.js';
import { Avatar } from '../internal/avatar.js';
/**
 * Facebook chrome: top header with logo, search, and primary tabs.
 * Wraps any preview as the page body.
 */
export function FacebookChrome({ children, avatarUrl, displayName = 'User', className, ariaLabel = 'Facebook preview', searchLabel = 'Search', }) {
    return (_jsxs("section", { className: cn('min-h-[400px] overflow-hidden bg-gray-100', className), "aria-label": ariaLabel, children: [_jsxs("header", { className: "sticky top-0 z-20 bg-white shadow-sm", children: [_jsxs("div", { className: "flex items-center justify-between px-4 py-2", children: [_jsxs("svg", { className: "h-10 w-10 text-[#1877F2]", viewBox: "0 0 36 36", fill: "currentColor", "aria-hidden": "true", children: [_jsx("path", { d: "M20.181 35.87C29.094 34.791 36 27.202 36 18c0-9.941-8.059-18-18-18S0 8.059 0 18c0 8.442 5.811 15.526 13.652 17.471L14 34h5.5l.681 1.87Z" }), _jsx("path", { fill: "white", d: "M13.651 35.471v-11.97H9.936V18h3.715v-2.37c0-6.127 2.772-8.964 8.784-8.964 1.138 0 3.103.223 3.91.446v4.983c-.425-.043-1.167-.065-2.081-.065-2.952 0-4.09 1.116-4.09 4.025V18h5.883l-1.01 5.5h-4.867l.006 12.34a18.142 18.142 0 0 1-6.535-.369Z" })] }), _jsx("div", { className: "mx-4 max-w-xs flex-1", children: _jsxs("div", { className: "flex items-center rounded-full bg-gray-100 px-3 py-2", children: [_jsx(Search, { className: "h-4 w-4 text-gray-500", "aria-hidden": "true" }), _jsx("span", { className: "ml-2 text-gray-500 text-sm", children: searchLabel })] }) }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { type: "button", className: "inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-gray-100 p-2 hover:bg-gray-200", "aria-label": "Menu", children: _jsx(Menu, { className: "h-5 w-5 text-gray-700" }) }), _jsxs("button", { type: "button", className: "relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-full bg-gray-100 p-2 hover:bg-gray-200", "aria-label": "Notifications", children: [_jsx(Bell, { className: "h-5 w-5 text-gray-700" }), _jsx("span", { className: "-top-0.5 -right-0.5 absolute flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white", children: "3" })] }), _jsx(Avatar, { src: avatarUrl, displayName: displayName, className: "h-9 w-9" })] })] }), _jsx("div", { className: "flex items-center border-gray-200 border-t", children: [
                            ['Home', Home, true],
                            ['Watch', Tv, false],
                            ['Shop', Store, false],
                            ['Groups', Users, false],
                            ['Notifications', Bell, false],
                            ['Menu', Menu, false],
                        ].map(([label, Icon, active]) => (_jsx("button", { type: "button", "aria-label": label, className: cn('flex min-h-11 flex-1 items-center justify-center py-3', active
                                ? 'border-[#1877F2] border-b-[3px] text-[#1877F2]'
                                : 'text-gray-500 hover:bg-gray-100'), children: _jsx(Icon, { className: "h-6 w-6", ...(active ? { fill: 'currentColor' } : {}) }) }, label))) })] }), _jsx("main", { className: "bg-gray-100", children: children })] }));
}
