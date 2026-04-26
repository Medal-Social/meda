import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Inspector } from './inspector.js';

describe('Inspector', () => {
  it('renders the first tab content by default', () => {
    cleanup();
    const tabs = [
      { id: 'overview', label: 'Overview', content: <div>OVERVIEW PANEL</div> },
      { id: 'logs', label: 'Logs', content: <div>LOGS PANEL</div> },
    ];
    render(<Inspector tabs={tabs} />);
    expect(screen.getByText('OVERVIEW PANEL')).toBeInTheDocument();
    expect(screen.queryByText('LOGS PANEL')).not.toBeInTheDocument();
  });

  it('switches active tab on click', () => {
    cleanup();
    const tabs = [
      { id: 'overview', label: 'Overview', content: <div>OVERVIEW PANEL</div> },
      { id: 'logs', label: 'Logs', content: <div>LOGS PANEL</div> },
    ];
    render(<Inspector tabs={tabs} />);
    const logsButton = screen.getAllByRole('tab').find((el) => el.textContent?.includes('Logs'));
    if (logsButton) fireEvent.click(logsButton);
    expect(screen.getByText('LOGS PANEL')).toBeInTheDocument();
    expect(screen.queryByText('OVERVIEW PANEL')).not.toBeInTheDocument();
  });

  it('honors defaultTab', () => {
    cleanup();
    const tabs = [
      { id: 'overview', label: 'Overview', content: <div>OVERVIEW PANEL</div> },
      { id: 'logs', label: 'Logs', content: <div>LOGS PANEL</div> },
    ];
    render(<Inspector tabs={tabs} defaultTab="logs" />);
    expect(screen.getByText('LOGS PANEL')).toBeInTheDocument();
  });
});
