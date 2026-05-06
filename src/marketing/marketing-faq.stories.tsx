import type { Meta, StoryObj } from '@storybook/react-vite';
import { MarketingFAQ } from './marketing-faq.js';

const meta = {
  title: 'Marketing/FAQ',
  component: MarketingFAQ,
  parameters: { layout: 'fullscreen' },
  args: {
    eyebrow: 'FAQ',
    title: 'Common questions',
    items: [
      {
        id: 'q1',
        question: 'What is Medal?',
        answer: 'A marketing platform that plans, posts, nurtures, and converts.',
      },
      {
        id: 'q2',
        question: 'How much does it cost?',
        answer: 'There is a free tier and a paid plan.',
      },
      { id: 'q3', question: 'Do I need a credit card?', answer: 'No.' },
    ],
  },
} satisfies Meta<typeof MarketingFAQ>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
