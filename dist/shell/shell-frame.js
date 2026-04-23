import { jsxs as _jsxs } from "react/jsx-runtime";
export function ShellFrame({ header, navigation, mobileSidebar, mobileHeader, tabBar, content, desktopDock, tabletPanel, mobileBottomNav, commandPalette, }) {
    return (_jsxs("div", { "data-testid": "shell-frame", className: "flex h-screen w-full flex-1 flex-col overflow-hidden bg-[var(--background)]", children: [header, _jsxs("div", { className: "flex min-h-0 flex-1 overflow-hidden", children: [navigation, mobileSidebar, _jsxs("div", { className: "flex min-w-0 flex-1 flex-col overflow-hidden", children: [mobileHeader, tabBar, _jsxs("div", { className: "relative min-h-0 flex-1 overflow-hidden", children: [content, desktopDock] })] }), tabletPanel, mobileBottomNav] }), commandPalette] }));
}
