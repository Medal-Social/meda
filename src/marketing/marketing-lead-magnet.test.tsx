import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MarketingLeadMagnet } from './marketing-lead-magnet.js';

describe('MarketingLeadMagnet', () => {
  it('renders lead content and opens a form dialog', async () => {
    render(
      <MarketingLeadMagnet
        title="Get the launch checklist"
        description="A practical guide for shipping campaign pages."
        benefits={['Planning template', 'QA checklist']}
        buttonText="Download checklist"
        formTitle="Send me the checklist"
        form={<form aria-label="Download form">FORM SLOT</form>}
      />
    );

    expect(screen.getByRole('heading', { name: 'Get the launch checklist' })).toBeInTheDocument();
    expect(screen.getByText('Planning template')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Download checklist' }));

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Send me the checklist' })).toBeInTheDocument();
    expect(screen.getByRole('form', { name: 'Download form' })).toHaveTextContent('FORM SLOT');
  });

  it('supports controlled open state', () => {
    const onOpenChange = vi.fn();
    render(
      <MarketingLeadMagnet
        title="Get the guide"
        buttonText="Open guide"
        form={<form aria-label="Controlled form" />}
        open={false}
        onOpenChange={onOpenChange}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Open guide' }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
