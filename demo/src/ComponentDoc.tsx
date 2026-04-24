import type { ReactNode } from 'react';

interface ComponentDocProps {
  name: string;
  description: string;
  registryItem?: string; // shadcn registry JSON name (optional — some are npm-only exports)
  code: string;
  children: ReactNode;
}

/**
 * Layout wrapper for a single component's documentation entry on the landing page.
 * Renders: title, description, install command, live preview in a bordered surface,
 * and the minimal usage code block.
 */
export function ComponentDoc({
  name,
  description,
  registryItem,
  code,
  children,
}: ComponentDocProps) {
  return (
    <article className="component-doc">
      <header className="component-doc-header">
        <div>
          <div className="component-doc-eyebrow">Component</div>
          <h3 className="component-doc-title">
            <code>{name}</code>
          </h3>
          <p className="component-doc-desc">{description}</p>
        </div>
      </header>

      <div className="component-doc-preview">{children}</div>

      <div className="component-doc-code">
        {registryItem && (
          <pre className="codeblock codeblock--inline">
            <span className="prompt">$ </span>npx shadcn add .../r/{registryItem}.json
          </pre>
        )}
        <pre className="codeblock codeblock--inline">{code}</pre>
      </div>
    </article>
  );
}
