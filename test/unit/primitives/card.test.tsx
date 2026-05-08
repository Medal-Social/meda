import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Card } from '../../../src/primitives/card.js';

describe('Card', () => {
  it('renders header, body, and footer with their slot markers', () => {
    render(
      <Card data-testid="card">
        <Card.Header>
          <h3>Plan settings</h3>
        </Card.Header>
        <Card.Body>
          <p>Body content</p>
        </Card.Body>
        <Card.Footer>
          <button type="button">Save</button>
        </Card.Footer>
      </Card>
    );

    const root = screen.getByTestId('card');
    expect(root).toHaveAttribute('data-slot', 'card');
    expect(root.querySelector('[data-slot="card-header"]')).not.toBeNull();
    expect(root.querySelector('[data-slot="card-body"]')).not.toBeNull();
    expect(root.querySelector('[data-slot="card-footer"]')).not.toBeNull();
    expect(screen.getByRole('heading', { name: 'Plan settings' })).toBeInTheDocument();
    expect(screen.getByText('Body content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
  });

  it('renders only a body when header and footer are omitted', () => {
    render(
      <Card data-testid="card">
        <Card.Body>
          <p>Just a body</p>
        </Card.Body>
      </Card>
    );

    const root = screen.getByTestId('card');
    expect(root.querySelector('[data-slot="card-header"]')).toBeNull();
    expect(root.querySelector('[data-slot="card-footer"]')).toBeNull();
    expect(screen.getByText('Just a body')).toBeInTheDocument();
  });

  it('forwards className overrides on root and every part', () => {
    render(
      <Card data-testid="card" className="custom-card">
        <Card.Header className="custom-header" data-testid="header">
          <span>Title</span>
        </Card.Header>
        <Card.Body className="custom-body" data-testid="body">
          <span>Body</span>
        </Card.Body>
        <Card.Footer className="custom-footer" data-testid="footer">
          <span>Foot</span>
        </Card.Footer>
      </Card>
    );

    expect(screen.getByTestId('card')).toHaveClass('custom-card');
    expect(screen.getByTestId('header')).toHaveClass('custom-header');
    expect(screen.getByTestId('body')).toHaveClass('custom-body');
    expect(screen.getByTestId('footer')).toHaveClass('custom-footer');
  });

  it('forwards arbitrary HTML attributes to the root element', () => {
    render(
      <Card data-testid="card" role="region" aria-label="Plan card">
        <Card.Body>Body</Card.Body>
      </Card>
    );

    expect(screen.getByRole('region', { name: 'Plan card' })).toBe(screen.getByTestId('card'));
  });
});
