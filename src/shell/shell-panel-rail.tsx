import type { ShellPanelDefinition } from './types';

export interface ShellPanelRailProps {
  moduleViews: ShellPanelDefinition[];
  globalViews: ShellPanelDefinition[];
  activePanelView: string | null;
  className?: string;
  onTogglePanelView: (viewId: string) => void;
}

function joinClasses(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

function PanelRailButtons({
  views,
  activePanelView,
  onTogglePanelView,
}: {
  views: ShellPanelDefinition[];
  activePanelView: string | null;
  onTogglePanelView: (viewId: string) => void;
}) {
  return (
    <div className="flex w-full flex-col items-center gap-1">
      {views.map(({ id, label, icon: Icon }) => {
        const isActive = activePanelView === id;

        return (
          <button
            key={id}
            type="button"
            aria-label={label}
            aria-pressed={isActive}
            onClick={() => onTogglePanelView(id)}
            className={joinClasses(
              'flex w-full flex-col items-center gap-1 rounded-xl px-1 py-2 text-[var(--app-rail-foreground)] transition-colors',
              isActive
                ? 'bg-[var(--app-rail-item-active-bg)] text-[var(--foreground)]'
                : 'hover:bg-[var(--surface-highlight)] hover:text-[var(--foreground)]'
            )}
          >
            <Icon size={16} />
            <span className="text-[9px] font-medium leading-none">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function ShellPanelRail({
  moduleViews,
  globalViews,
  activePanelView,
  className,
  onTogglePanelView,
}: ShellPanelRailProps) {
  if (moduleViews.length === 0 && globalViews.length === 0) return null;

  return (
    <aside
      aria-label="Panel rail"
      className={joinClasses(
        'flex h-full w-[var(--right-rail-width)] shrink-0 flex-col items-center bg-[var(--app-rail)] px-1.5 py-3',
        className
      )}
    >
      <PanelRailButtons
        views={moduleViews}
        activePanelView={activePanelView}
        onTogglePanelView={onTogglePanelView}
      />
      <div className="grow" />
      <PanelRailButtons
        views={globalViews}
        activePanelView={activePanelView}
        onTogglePanelView={onTogglePanelView}
      />
    </aside>
  );
}
