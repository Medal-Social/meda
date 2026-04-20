import type { ReactNode } from 'react';
import type { ShellModuleDefinition, ShellNavItem } from './types';

interface ShellModuleNavRenderArgs {
  children: ReactNode;
  className: string;
  isActive: boolean;
  item: ShellNavItem;
}

export interface ShellModuleNavProps {
  module: Pick<ShellModuleDefinition, 'description' | 'items' | 'label'>;
  ariaLabel: string;
  className?: string;
  descriptionClassName?: string;
  headerClassName?: string;
  itemClassName?: string;
  activeItemClassName?: string;
  inactiveItemClassName?: string;
  itemsClassName?: string;
  itemIconClassName?: string;
  itemIconSize?: number;
  itemLabelClassName?: string;
  itemDescriptionClassName?: string;
  itemShortcutClassName?: string;
  titleClassName?: string;
  isItemActive: (item: ShellNavItem) => boolean;
  renderLink: (args: ShellModuleNavRenderArgs) => ReactNode;
}

function joinClasses(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export function ShellModuleNav({
  module,
  ariaLabel,
  className,
  descriptionClassName,
  headerClassName,
  itemClassName,
  activeItemClassName,
  inactiveItemClassName,
  itemsClassName,
  itemIconClassName,
  itemIconSize = 18,
  itemLabelClassName,
  itemDescriptionClassName,
  itemShortcutClassName,
  titleClassName,
  isItemActive,
  renderLink,
}: ShellModuleNavProps) {
  return (
    <div className={className}>
      <div className={headerClassName}>
        <div className={titleClassName}>{module.label}</div>
        {module.description ? (
          <div className={descriptionClassName}>{module.description}</div>
        ) : null}
      </div>

      <nav aria-label={ariaLabel} className={itemsClassName}>
        {module.items.map((item) => {
          const isActive = isItemActive(item);
          const Icon = item.icon;

          return renderLink({
            item,
            isActive,
            className: joinClasses(
              itemClassName,
              isActive ? activeItemClassName : inactiveItemClassName
            ),
            children: (
              <>
                <Icon size={itemIconSize} className={itemIconClassName} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className={itemLabelClassName}>{item.label}</span>
                  {item.description ? (
                    <span className={itemDescriptionClassName}>{item.description}</span>
                  ) : null}
                </div>
                {item.shortcut ? (
                  <kbd className={itemShortcutClassName}>{item.shortcut}</kbd>
                ) : null}
              </>
            ),
          });
        })}
      </nav>
    </div>
  );
}
