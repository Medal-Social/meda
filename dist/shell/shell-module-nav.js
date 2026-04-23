import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
function joinClasses(...values) {
    return values.filter(Boolean).join(' ');
}
export function ShellModuleNav({ module, ariaLabel, className, descriptionClassName, headerClassName, itemClassName, activeItemClassName, inactiveItemClassName, itemsClassName, itemIconClassName, itemIconSize = 18, itemLabelClassName, itemDescriptionClassName, itemShortcutClassName, titleClassName, isItemActive, renderLink, }) {
    return (_jsxs("div", { className: className, children: [_jsxs("div", { className: headerClassName, children: [_jsx("div", { className: titleClassName, children: module.label }), module.description ? (_jsx("div", { className: descriptionClassName, children: module.description })) : null] }), _jsx("nav", { "aria-label": ariaLabel, className: itemsClassName, children: module.items.map((item) => {
                    const isActive = isItemActive(item);
                    const Icon = item.icon;
                    return renderLink({
                        item,
                        isActive,
                        className: joinClasses(itemClassName, isActive ? activeItemClassName : inactiveItemClassName),
                        children: (_jsxs(_Fragment, { children: [_jsx(Icon, { size: itemIconSize, className: itemIconClassName }), _jsxs("div", { className: "flex min-w-0 flex-1 flex-col", children: [_jsx("span", { className: itemLabelClassName, children: item.label }), item.description ? (_jsx("span", { className: itemDescriptionClassName, children: item.description })) : null] }), item.shortcut ? (_jsx("kbd", { className: itemShortcutClassName, children: item.shortcut })) : null] })),
                    });
                }) })] }));
}
