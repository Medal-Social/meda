import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from './card.js';

const meta = {
  title: 'Foundations/Primitives/Card',
  component: Card,
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="max-w-md">
      <Card.Header>
        <h3 className="text-sm font-semibold text-foreground">Plan settings</h3>
        <p className="text-xs text-muted-foreground">Manage your subscription details.</p>
      </Card.Header>
      <Card.Body>
        <p className="text-sm text-muted-foreground">
          You are on the Pro plan. Renews on the 12th of each month.
        </p>
      </Card.Body>
      <Card.Footer>
        <button type="button" className="rounded-md border border-border px-3 py-1.5 text-sm">
          Cancel
        </button>
        <button
          type="button"
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
        >
          Manage
        </button>
      </Card.Footer>
    </Card>
  ),
};

export const BodyOnly: Story = {
  render: () => (
    <Card className="max-w-md">
      <Card.Body>
        <p className="text-sm text-foreground">
          Cards work fine with just a body — no header or footer required.
        </p>
      </Card.Body>
    </Card>
  ),
};

export const PartialCompositions: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Card>
        <Card.Header>
          <h3 className="text-sm font-semibold text-foreground">Plan settings</h3>
          <p className="text-xs text-muted-foreground">Header + body, no footer.</p>
        </Card.Header>
        <Card.Body>
          <p className="text-sm text-muted-foreground">
            The header should sit flush against the body — its bottom border collapses when it is
            the last child.
          </p>
        </Card.Body>
      </Card>
      <Card>
        <Card.Body>
          <p className="text-sm text-muted-foreground">
            Body + footer, no header. The footer&rsquo;s top border collapses when it follows the
            body directly.
          </p>
        </Card.Body>
        <Card.Footer>
          <button type="button" className="rounded-md border border-border px-3 py-1.5 text-sm">
            Dismiss
          </button>
          <button
            type="button"
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
          >
            Confirm
          </button>
        </Card.Footer>
      </Card>
    </div>
  ),
};

export const Tile: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {[
        { label: 'Active', value: '128' },
        { label: 'In review', value: '12' },
        { label: 'Archived', value: '64' },
      ].map((tile) => (
        <Card key={tile.label}>
          <Card.Body>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{tile.label}</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">{tile.value}</p>
          </Card.Body>
        </Card>
      ))}
    </div>
  ),
};
