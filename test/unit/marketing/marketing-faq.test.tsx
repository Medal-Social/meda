import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MarketingFAQ } from '../../../src/marketing/marketing-faq.js';

describe('MarketingFAQ', () => {
  const items = [
    { id: 'q1', question: 'What is Medal?', answer: 'A marketing platform.' },
    { id: 'q2', question: 'How much does it cost?', answer: 'Starts free.' },
  ];

  it('renders all questions and toggles answers on click', () => {
    render(<MarketingFAQ items={items} />);
    const trigger = screen.getByRole('button', { name: 'What is Medal?' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('A marketing platform.')).toBeVisible();
  });

  it('opens defaultOpenId on mount', () => {
    render(<MarketingFAQ items={items} defaultOpenId="q2" />);
    const t2 = screen.getByRole('button', { name: 'How much does it cost?' });
    expect(t2).toHaveAttribute('aria-expanded', 'true');
  });
});
