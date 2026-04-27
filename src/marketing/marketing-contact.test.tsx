import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MarketingContact } from './marketing-contact.js';

describe('MarketingContact', () => {
  it('renders the form slot with office and contact person details', () => {
    render(
      <MarketingContact
        intro="Talk to the team"
        form={<form aria-label="Lead form">FORM SLOT</form>}
        office={{
          title: 'Oslo office',
          address: 'Torggata 1, Oslo',
          email: 'hello@medalsocial.com',
          phone: '+47 22 00 00 00',
          hours: 'Mon-Fri, 09:00-17:00',
        }}
        contactPerson={{
          title: 'Direct contact',
          name: 'Ali',
          role: 'Marketing lead',
          description: 'Helps teams launch faster.',
          email: 'ali@medalsocial.com',
          phone: '+47 99 00 00 00',
        }}
      />
    );

    expect(screen.getByText('Talk to the team')).toBeInTheDocument();
    expect(screen.getByRole('form', { name: 'Lead form' })).toHaveTextContent('FORM SLOT');
    expect(screen.getByText('Oslo office')).toBeInTheDocument();
    expect(screen.getByText('Torggata 1, Oslo')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'hello@medalsocial.com' })).toHaveAttribute(
      'href',
      'mailto:hello@medalsocial.com'
    );
    expect(screen.getByRole('link', { name: '+47 22 00 00 00' })).toHaveAttribute(
      'href',
      'tel:+4722000000'
    );
    expect(screen.getByText('Direct contact')).toBeInTheDocument();
    expect(screen.getByText('Ali')).toBeInTheDocument();
    expect(screen.getByText('Marketing lead')).toBeInTheDocument();
  });
});
