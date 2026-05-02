// Curated email-safe font stacks. Web fonts are unreliable across email clients;
// we offer system fallbacks that look reasonable everywhere.
export interface EmailFontOption {
  label: string;
  value: string;
}

export const EMAIL_FONT_OPTIONS: EmailFontOption[] = [
  { label: 'Inherit', value: '' },
  {
    label: 'System',
    value:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Georgia', value: 'Georgia, "Times New Roman", serif' },
  { label: 'Helvetica', value: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
  { label: 'Times', value: '"Times New Roman", Times, serif' },
  { label: 'Courier', value: '"Courier New", Courier, monospace' },
];
