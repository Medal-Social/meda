'use client';

import { Dialog } from '@base-ui/react/dialog';
import { CheckCircle2, X } from 'lucide-react';
import type { MarketingLeadMagnetProps } from './types.js';
import { cx } from './utils.js';

export function MarketingLeadMagnet({
  title,
  description,
  benefits = [],
  image,
  buttonText = 'Download now',
  formTitle = 'Get the resource',
  form,
  variant = 'featured',
  open,
  defaultOpen,
  onOpenChange,
  className,
}: MarketingLeadMagnetProps) {
  const isSidebar = variant === 'sidebar';

  return (
    <section
      className={cx(
        'overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm',
        isSidebar ? 'p-6' : 'p-6 sm:p-8 lg:p-10',
        className
      )}
    >
      <div className={cx('grid gap-8', isSidebar ? 'grid-cols-1' : 'lg:grid-cols-[0.8fr_1fr]')}>
        {!isSidebar && image && <div className="overflow-hidden rounded-lg bg-muted">{image}</div>}
        <div className="flex min-w-0 flex-col items-start justify-center">
          <h2 className="text-2xl font-bold leading-tight text-foreground sm:text-3xl">{title}</h2>
          {description && (
            <p className="mt-3 text-base leading-7 text-muted-foreground">{description}</p>
          )}
          {benefits.length > 0 && (
            <ul className="mt-5 space-y-3">
              {benefits.map((benefit, index) => (
                <li
                  key={typeof benefit === 'string' ? `${benefit}-${index}` : `benefit-${index}`}
                  className="flex items-start gap-3 text-sm leading-6 text-muted-foreground"
                >
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          )}

          <Dialog.Root
            open={open}
            defaultOpen={defaultOpen}
            onOpenChange={(nextOpen) => onOpenChange?.(nextOpen)}
          >
            <Dialog.Trigger className="mt-6 inline-flex min-h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
              {buttonText}
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Backdrop className="fixed inset-0 z-modal bg-background/80 backdrop-blur-sm" />
              <Dialog.Popup className="fixed left-1/2 top-1/2 z-modal w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-lg focus-visible:outline-none">
                <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
                  <Dialog.Title className="text-lg font-semibold text-foreground">
                    {formTitle}
                  </Dialog.Title>
                  <Dialog.Close className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <span className="sr-only">Close</span>
                    <X className="size-4" aria-hidden />
                  </Dialog.Close>
                </div>
                <div className="p-6">{form}</div>
              </Dialog.Popup>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>
    </section>
  );
}
