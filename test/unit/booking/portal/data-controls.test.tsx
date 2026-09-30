import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { dataControlsLabelsNb as L } from '../../../../src/booking/__stories__/labels.portal-forms.js';
import {
  DataControls,
  type DataControlsProps,
} from '../../../../src/booking/portal/data-controls.js';

const createObjectURL = vi.fn<(blob: Blob) => string>(() => 'blob:test');
const revokeObjectURL = vi.fn();
const onExport = vi.fn<DataControlsProps['onExport']>();
const onDelete = vi.fn<DataControlsProps['onDelete']>();
const onSessionExpired = vi.fn();

function renderControls(props: Partial<DataControlsProps> = {}) {
  return render(
    <DataControls
      labels={L}
      onExport={onExport}
      onDelete={onDelete}
      onSessionExpired={onSessionExpired}
      {...props}
    />
  );
}

const CONFIRM = /Skriv SLETT for å bekrefte/;

beforeEach(() => {
  vi.clearAllMocks();
  // jsdom has no object URLs; the component only needs them to exist.
  Object.assign(URL, { createObjectURL, revokeObjectURL });
});

afterEach(() => {
  Reflect.deleteProperty(URL, 'createObjectURL');
  Reflect.deleteProperty(URL, 'revokeObjectURL');
});

describe('DataControls', () => {
  it('turns the export into a file download named by the callback', async () => {
    onExport.mockResolvedValue({ ok: true, filename: 'my-data-2026-09-05.json', json: '{"a":1}' });
    // `sameTurn` is true only for the synchronous turn `click()` runs in. A
    // revoke that reads it as `true` happened before a download could start.
    let sameTurn = false;
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {
      sameTurn = true;
      queueMicrotask(() => {
        sameTurn = false;
      });
    });
    const revokedInClickTurn: boolean[] = [];
    revokeObjectURL.mockImplementation(() => revokedInClickTurn.push(sameTurn));
    renderControls();

    fireEvent.click(screen.getByRole('button', { name: L['dataControls.export'] }));

    await waitFor(() => expect(click).toHaveBeenCalledTimes(1));
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    const blob = createObjectURL.mock.calls[0]?.[0] as Blob;
    expect(blob).toBeInstanceOf(Blob);
    expect(await blob.text()).toBe('{"a":1}');
    const anchor = click.mock.instances[0] as unknown as HTMLAnchorElement;
    expect(anchor.download).toBe('my-data-2026-09-05.json');
    await waitFor(() => expect(revokeObjectURL).toHaveBeenCalledWith('blob:test'));
    expect(revokedInClickTurn).toEqual([false]);
    // Nothing of the export is left in the page.
    expect(document.body.innerHTML).not.toContain('"a":1');
    click.mockRestore();
  });

  it('downloads nothing when the caller delivered the file itself', async () => {
    onExport.mockResolvedValue({ ok: true });
    renderControls();
    fireEvent.click(screen.getByRole('button', { name: L['dataControls.export'] }));
    await waitFor(() => expect(onExport).toHaveBeenCalled());
    expect(createObjectURL).not.toHaveBeenCalled();
  });

  it('says why an export failed, and reports a dead session', async () => {
    onExport.mockResolvedValue({ ok: false, kind: 'error' });
    const { unmount } = renderControls();
    fireEvent.click(screen.getByRole('button', { name: L['dataControls.export'] }));
    expect(await screen.findByText(L['dataControls.unreachable'])).toBeInTheDocument();
    unmount();

    onExport.mockResolvedValue({ ok: false, kind: 'session' });
    renderControls();
    fireEvent.click(screen.getByRole('button', { name: L['dataControls.export'] }));
    await waitFor(() => expect(onSessionExpired).toHaveBeenCalledTimes(1));
  });

  it('opens the confirm panel with the consequences before anything is deleted', () => {
    renderControls();

    expect(screen.queryByLabelText(CONFIRM)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: L['dataControls.delete'] }));

    expect(screen.getByText(L['dataControls.consequences'])).toBeInTheDocument();
    expect(screen.getByLabelText(CONFIRM)).toBeInTheDocument();
    expect(
      screen.getByRole('form', { name: L['dataControls.confirmHeading'] })
    ).toBeInTheDocument();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('does not call back unless the word is typed exactly', () => {
    renderControls();
    fireEvent.click(screen.getByRole('button', { name: L['dataControls.delete'] }));

    fireEvent.change(screen.getByLabelText(CONFIRM), { target: { value: 'slett' } });
    fireEvent.click(screen.getByRole('button', { name: L['dataControls.deleteForever'] }));

    expect(onDelete).not.toHaveBeenCalled();
    const error = screen.getByText('Skriv SLETT nøyaktig slik, med store bokstaver.');
    expect(screen.getByLabelText(CONFIRM)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText(CONFIRM).getAttribute('aria-describedby')).toContain(error.id);
  });

  it('deletes with the literal word (trimmed)', async () => {
    onDelete.mockResolvedValue({ ok: true });
    renderControls();
    fireEvent.click(screen.getByRole('button', { name: L['dataControls.delete'] }));

    fireEvent.change(screen.getByLabelText(CONFIRM), { target: { value: ' SLETT ' } });
    fireEvent.click(screen.getByRole('button', { name: L['dataControls.deleteForever'] }));

    await waitFor(() => expect(onDelete).toHaveBeenCalledWith('SLETT'));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('shows why a delete failed', async () => {
    onDelete.mockResolvedValue({ ok: false, kind: 'error', message: 'Try later.' });
    renderControls();
    fireEvent.click(screen.getByRole('button', { name: L['dataControls.delete'] }));
    fireEvent.change(screen.getByLabelText(CONFIRM), { target: { value: 'SLETT' } });
    fireEvent.click(screen.getByRole('button', { name: L['dataControls.deleteForever'] }));

    expect(await screen.findByText('Try later.')).toBeInTheDocument();
  });

  it('can be backed out of', () => {
    renderControls();
    fireEvent.click(screen.getByRole('button', { name: L['dataControls.delete'] }));
    fireEvent.click(screen.getByRole('button', { name: L['dataControls.cancel'] }));

    expect(screen.queryByLabelText(CONFIRM)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: L['dataControls.delete'] })).toBeInTheDocument();
  });

  it('uses the confirm word from the labels', async () => {
    onDelete.mockResolvedValue({ ok: true });
    renderControls({
      labels: {
        ...L,
        'dataControls.confirmWord': 'DELETE',
        'dataControls.confirmLabel': 'Type {word}',
      },
    });
    fireEvent.click(screen.getByRole('button', { name: L['dataControls.delete'] }));
    fireEvent.change(screen.getByLabelText('Type DELETE'), { target: { value: 'DELETE' } });
    fireEvent.click(screen.getByRole('button', { name: L['dataControls.deleteForever'] }));
    await waitFor(() => expect(onDelete).toHaveBeenCalledWith('DELETE'));
  });

  it('puts slot classes on their elements', () => {
    const { container } = renderControls({
      classNames: { root: 'slot-root', confirm: 'slot-confirm', actions: 'slot-actions' },
    });
    fireEvent.click(screen.getByRole('button', { name: L['dataControls.delete'] }));
    expect(container.querySelector('section')).toHaveClass('slot-root');
    expect(container.querySelector('form')).toHaveClass('slot-confirm', 'bg-destructive/10');
    expect(
      screen.getByRole('button', { name: L['dataControls.export'] }).parentElement
    ).toHaveClass('slot-actions');
  });

  it('has no axe violations with the confirm panel open', async () => {
    const { container } = renderControls();
    fireEvent.click(screen.getByRole('button', { name: L['dataControls.delete'] }));
    expect(
      await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    ).toHaveNoViolations();
  });
});
