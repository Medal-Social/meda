import * as LucideIcons from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';

export type IconCatalogProps = {
  names: string[];
};

export function IconCatalog({ names }: IconCatalogProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3">
      {names.map((name) => {
        const Icon = (LucideIcons as Record<string, unknown>)[name] as
          | ComponentType<SVGProps<SVGSVGElement>>
          | undefined;

        return (
          <div
            key={name}
            data-icon-tile
            className="flex flex-col items-center gap-2 rounded-md border border-[var(--border)] p-3 text-[var(--foreground)]"
          >
            {Icon ? <Icon aria-hidden="true" height={24} width={24} /> : null}
            <code className="font-[var(--font-family-mono)] text-[11px] text-[var(--muted-foreground)]">
              {name}
            </code>
          </div>
        );
      })}
    </div>
  );
}
