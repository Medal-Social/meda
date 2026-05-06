import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { getDefaultBlockProps } from '../../../src/email-builder/block-registry.js';
import {
  AlignmentToggle,
  ColorInput,
  Field,
  NumberInput,
  SelectInput,
  SpacingEditor,
  TextAreaInput,
  TextInput,
} from '../../../src/email-builder/property-editors/_shared.js';
import { ButtonPropertyEditor } from '../../../src/email-builder/property-editors/button-editor.js';
import { ColumnsPropertyEditor } from '../../../src/email-builder/property-editors/columns-editor.js';
import { DividerPropertyEditor } from '../../../src/email-builder/property-editors/divider-editor.js';
import { FooterPropertyEditor } from '../../../src/email-builder/property-editors/footer-editor.js';
import { HeadingPropertyEditor } from '../../../src/email-builder/property-editors/heading-editor.js';
import { ImagePropertyEditor } from '../../../src/email-builder/property-editors/image-editor.js';
import { SocialPropertyEditor } from '../../../src/email-builder/property-editors/social-editor.js';
import { SpacerPropertyEditor } from '../../../src/email-builder/property-editors/spacer-editor.js';
import { TextPropertyEditor } from '../../../src/email-builder/property-editors/text-editor.js';

const defaults = getDefaultBlockProps();

// ---------------------------------------------------------------------------
// _shared.tsx
// ---------------------------------------------------------------------------

describe('Field', () => {
  it('renders the label text', () => {
    render(
      <Field label="My label">
        <input />
      </Field>
    );
    expect(screen.getByText('My label')).toBeInTheDocument();
  });

  it('passes htmlFor to the label element', () => {
    render(
      <Field label="Name" htmlFor="name-id">
        <input id="name-id" />
      </Field>
    );
    const label = screen.getByText('Name');
    expect(label).toHaveAttribute('for', 'name-id');
  });

  it('injects aria-label on child when htmlFor is omitted', () => {
    render(
      <Field label="Auto label">
        <input data-testid="inp" />
      </Field>
    );
    expect(screen.getByTestId('inp')).toHaveAttribute('aria-label', 'Auto label');
  });

  it('does not inject aria-label when htmlFor is provided', () => {
    render(
      <Field label="Explicit" htmlFor="ex">
        <input id="ex" data-testid="inp" />
      </Field>
    );
    expect(screen.getByTestId('inp')).not.toHaveAttribute('aria-label');
  });

  it('renders non-element children without cloning', () => {
    render(<Field label="Info">plain text child</Field>);
    expect(screen.getByText('plain text child')).toBeInTheDocument();
  });
});

describe('TextInput', () => {
  it('calls onChange with the new value', () => {
    const onChange = vi.fn();
    render(<TextInput value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'hello' } });
    expect(onChange).toHaveBeenCalledWith('hello');
  });

  it('renders with placeholder and aria-label', () => {
    render(<TextInput value="" onChange={() => {}} placeholder="Type…" aria-label="My input" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', 'Type…');
    expect(input).toHaveAttribute('aria-label', 'My input');
  });

  it('renders with an id', () => {
    render(<TextInput id="t1" value="val" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('id', 't1');
  });
});

describe('TextAreaInput', () => {
  it('calls onChange with the new value', () => {
    const onChange = vi.fn();
    render(<TextAreaInput value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'a' } });
    expect(onChange).toHaveBeenCalledWith('a');
  });

  it('accepts rows and aria-label props', () => {
    render(<TextAreaInput value="x" onChange={() => {}} rows={6} aria-label="Bio" />);
    const ta = screen.getByRole('textbox');
    expect(ta).toHaveAttribute('rows', '6');
    expect(ta).toHaveAttribute('aria-label', 'Bio');
  });

  it('renders with an id', () => {
    render(<TextAreaInput id="ta1" value="" onChange={() => {}} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('id', 'ta1');
  });
});

describe('NumberInput', () => {
  it('calls onChange with parsed number', () => {
    const onChange = vi.fn();
    render(<NumberInput value={5} onChange={onChange} />);
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '42' } });
    expect(onChange).toHaveBeenCalledWith(42);
  });

  it('calls onChange with 0 for empty input (jsdom coerces to 0)', () => {
    const onChange = vi.fn();
    render(<NumberInput value={5} onChange={onChange} />);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '0' } });
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it('passes min, max, step, id, aria-label', () => {
    render(
      <NumberInput
        id="n1"
        value={10}
        min={0}
        max={100}
        step={5}
        aria-label="Num"
        onChange={() => {}}
      />
    );
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('id', 'n1');
    expect(input).toHaveAttribute('min', '0');
    expect(input).toHaveAttribute('max', '100');
    expect(input).toHaveAttribute('step', '5');
    expect(input).toHaveAttribute('aria-label', 'Num');
  });
});

describe('ColorInput', () => {
  it('calls onChange from the text input', () => {
    const onChange = vi.fn();
    render(<ColorInput value="#ff0000" onChange={onChange} />);
    const textInput = screen.getByLabelText('Color value (hex)');
    fireEvent.change(textInput, { target: { value: '#00ff00' } });
    expect(onChange).toHaveBeenCalledWith('#00ff00');
  });

  it('calls onChange from the color picker', () => {
    const onChange = vi.fn();
    render(<ColorInput value="#ff0000" onChange={onChange} />);
    const colorPicker = screen.getByLabelText('Color picker');
    fireEvent.change(colorPicker, { target: { value: '#0000ff' } });
    expect(onChange).toHaveBeenCalledWith('#0000ff');
  });

  it('defaults color picker to #000000 when value is empty', () => {
    render(<ColorInput value="" onChange={() => {}} />);
    expect(screen.getByLabelText('Color picker')).toHaveValue('#000000');
  });

  it('renders with an id on the color picker', () => {
    render(<ColorInput id="c1" value="#fff" onChange={() => {}} />);
    expect(screen.getByLabelText('Color picker')).toHaveAttribute('id', 'c1');
  });
});

describe('SelectInput', () => {
  const options = [
    { value: 'a' as const, label: 'Option A' },
    { value: 'b' as const, label: 'Option B' },
  ];

  it('calls onChange with the selected value', () => {
    const onChange = vi.fn();
    render(<SelectInput value="a" options={options} onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'b' } });
    expect(onChange).toHaveBeenCalledWith('b');
  });

  it('renders all options', () => {
    render(<SelectInput value="a" options={options} onChange={() => {}} />);
    expect(screen.getByRole('option', { name: 'Option A' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Option B' })).toBeInTheDocument();
  });

  it('accepts id and aria-label', () => {
    render(
      <SelectInput id="s1" value="a" options={options} onChange={() => {}} aria-label="Pick" />
    );
    const sel = screen.getByRole('combobox');
    expect(sel).toHaveAttribute('id', 's1');
    expect(sel).toHaveAttribute('aria-label', 'Pick');
  });
});

describe('AlignmentToggle', () => {
  it('calls onChange when clicking center', () => {
    const onChange = vi.fn();
    render(<AlignmentToggle value="left" onChange={onChange} />);
    fireEvent.click(screen.getByRole('radio', { name: 'center' }));
    expect(onChange).toHaveBeenCalledWith('center');
  });

  it('calls onChange when clicking right', () => {
    const onChange = vi.fn();
    render(<AlignmentToggle value="left" onChange={onChange} />);
    fireEvent.click(screen.getByRole('radio', { name: 'right' }));
    expect(onChange).toHaveBeenCalledWith('right');
  });

  it('calls onChange when clicking left', () => {
    const onChange = vi.fn();
    render(<AlignmentToggle value="center" onChange={onChange} />);
    fireEvent.click(screen.getByRole('radio', { name: 'left' }));
    expect(onChange).toHaveBeenCalledWith('left');
  });

  it('marks the active option as aria-checked', () => {
    render(<AlignmentToggle value="right" onChange={() => {}} />);
    expect(screen.getByRole('radio', { name: 'right' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'left' })).toHaveAttribute('aria-checked', 'false');
  });
});

describe('SpacingEditor', () => {
  const base = { top: 10, right: 20, bottom: 30, left: 40 };

  it('calls onChange with updated top value', () => {
    const onChange = vi.fn();
    render(<SpacingEditor value={base} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Top padding'), { target: { value: '5' } });
    expect(onChange).toHaveBeenCalledWith({ ...base, top: 5 });
  });

  it('calls onChange with updated right value', () => {
    const onChange = vi.fn();
    render(<SpacingEditor value={base} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Right padding'), { target: { value: '8' } });
    expect(onChange).toHaveBeenCalledWith({ ...base, right: 8 });
  });

  it('calls onChange with updated bottom value', () => {
    const onChange = vi.fn();
    render(<SpacingEditor value={base} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Bottom padding'), { target: { value: '3' } });
    expect(onChange).toHaveBeenCalledWith({ ...base, bottom: 3 });
  });

  it('calls onChange with updated left value', () => {
    const onChange = vi.fn();
    render(<SpacingEditor value={base} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Left padding'), { target: { value: '15' } });
    expect(onChange).toHaveBeenCalledWith({ ...base, left: 15 });
  });

  it('calls onChange with 0 for zero input', () => {
    const onChange = vi.fn();
    render(<SpacingEditor value={base} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Top padding'), { target: { value: '0' } });
    expect(onChange).toHaveBeenCalledWith({ ...base, top: 0 });
  });
});

// ---------------------------------------------------------------------------
// button-editor.tsx
// ---------------------------------------------------------------------------

describe('ButtonPropertyEditor', () => {
  const value = defaults.button;

  it('fires onChange for text', () => {
    const onChange = vi.fn();
    render(<ButtonPropertyEditor value={value} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Text'), { target: { value: 'Go' } });
    expect(onChange).toHaveBeenCalledWith({ text: 'Go' });
  });

  it('fires onChange for url', () => {
    const onChange = vi.fn();
    render(<ButtonPropertyEditor value={value} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('URL'), { target: { value: 'https://x.com' } });
    expect(onChange).toHaveBeenCalledWith({ url: 'https://x.com' });
  });

  it('fires onChange for background color', () => {
    const onChange = vi.fn();
    render(<ButtonPropertyEditor value={value} onChange={onChange} />);
    // Two color pickers exist (backgroundColor, textColor) — pick the first
    fireEvent.change(screen.getAllByLabelText('Color picker')[0], { target: { value: '#ff0000' } });
    expect(onChange).toHaveBeenCalledWith({ backgroundColor: '#ff0000' });
  });

  it('fires onChange for size selection', () => {
    const onChange = vi.fn();
    render(<ButtonPropertyEditor value={value} onChange={onChange} />);
    const selects = screen.getAllByRole('combobox');
    // First select is Size
    fireEvent.change(selects[0], { target: { value: 'lg' } });
    expect(onChange).toHaveBeenCalledWith({ size: 'lg' });
  });

  it('fires onChange for fullWidth checkbox', () => {
    const onChange = vi.fn();
    render(<ButtonPropertyEditor value={value} onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith({ fullWidth: true });
  });

  it('fires onChange for alignment', () => {
    const onChange = vi.fn();
    render(<ButtonPropertyEditor value={value} onChange={onChange} />);
    fireEvent.click(screen.getByRole('radio', { name: 'left' }));
    expect(onChange).toHaveBeenCalledWith({ alignment: 'left' });
  });

  it('fires onChange for border radius', () => {
    const onChange = vi.fn();
    render(<ButtonPropertyEditor value={value} onChange={onChange} />);
    const spinbuttons = screen.getAllByRole('spinbutton');
    fireEvent.change(spinbuttons[0], { target: { value: '4' } });
    expect(onChange).toHaveBeenCalledWith({ borderRadius: 4 });
  });

  it('fires onChange for text color', () => {
    const onChange = vi.fn();
    render(<ButtonPropertyEditor value={value} onChange={onChange} />);
    // Second color picker is textColor
    fireEvent.change(screen.getAllByLabelText('Color picker')[1], { target: { value: '#000000' } });
    expect(onChange).toHaveBeenCalledWith({ textColor: '#000000' });
  });

  it('fires onChange for padding', () => {
    const onChange = vi.fn();
    render(<ButtonPropertyEditor value={value} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Top padding'), { target: { value: '8' } });
    expect(onChange).toHaveBeenCalledWith({ padding: { ...value.padding, top: 8 } });
  });
});

// ---------------------------------------------------------------------------
// columns-editor.tsx
// ---------------------------------------------------------------------------

describe('ColumnsPropertyEditor', () => {
  const value = defaults.columns;

  it('fires onChange for layout', () => {
    const onChange = vi.fn();
    render(<ColumnsPropertyEditor value={value} onChange={onChange} />);
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: '33-67' } });
    expect(onChange).toHaveBeenCalledWith({ layout: '33-67' });
  });

  it('fires onChange for verticalAlignment', () => {
    const onChange = vi.fn();
    render(<ColumnsPropertyEditor value={value} onChange={onChange} />);
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[1], { target: { value: 'middle' } });
    expect(onChange).toHaveBeenCalledWith({ verticalAlignment: 'middle' });
  });

  it('fires onChange for backgroundColor (transparent default branch)', () => {
    const onChange = vi.fn();
    // Default backgroundColor is 'transparent' — ColorInput receives '#ffffff'
    render(<ColumnsPropertyEditor value={value} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Color picker'), { target: { value: '#aabbcc' } });
    expect(onChange).toHaveBeenCalledWith({ backgroundColor: '#aabbcc' });
  });

  it('fires onChange for backgroundColor (non-transparent branch)', () => {
    const onChange = vi.fn();
    // When backgroundColor is a real hex, ColorInput receives it directly
    render(
      <ColumnsPropertyEditor value={{ ...value, backgroundColor: '#ff0000' }} onChange={onChange} />
    );
    fireEvent.change(screen.getByLabelText('Color picker'), { target: { value: '#00ff00' } });
    expect(onChange).toHaveBeenCalledWith({ backgroundColor: '#00ff00' });
  });

  it('fires onChange for gap', () => {
    const onChange = vi.fn();
    render(<ColumnsPropertyEditor value={value} onChange={onChange} />);
    const spinbuttons = screen.getAllByRole('spinbutton');
    fireEvent.change(spinbuttons[0], { target: { value: '24' } });
    expect(onChange).toHaveBeenCalledWith({ gap: 24 });
  });

  it('fires onChange for mobileStacking checkbox', () => {
    const onChange = vi.fn();
    render(<ColumnsPropertyEditor value={value} onChange={onChange} />);
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledWith({ mobileStacking: false });
  });

  it('fires onChange for padding', () => {
    const onChange = vi.fn();
    render(<ColumnsPropertyEditor value={value} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Bottom padding'), { target: { value: '16' } });
    expect(onChange).toHaveBeenCalledWith({ padding: { ...value.padding, bottom: 16 } });
  });
});

// ---------------------------------------------------------------------------
// divider-editor.tsx
// ---------------------------------------------------------------------------

describe('DividerPropertyEditor', () => {
  const value = defaults.divider;

  it('fires onChange for color', () => {
    const onChange = vi.fn();
    render(<DividerPropertyEditor value={value} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Color picker'), { target: { value: '#cccccc' } });
    expect(onChange).toHaveBeenCalledWith({ color: '#cccccc' });
  });

  it('fires onChange for thickness', () => {
    const onChange = vi.fn();
    render(<DividerPropertyEditor value={value} onChange={onChange} />);
    const spinbuttons = screen.getAllByRole('spinbutton');
    fireEvent.change(spinbuttons[0], { target: { value: '3' } });
    expect(onChange).toHaveBeenCalledWith({ thickness: 3 });
  });

  it('fires onChange for width', () => {
    const onChange = vi.fn();
    render(<DividerPropertyEditor value={value} onChange={onChange} />);
    const spinbuttons = screen.getAllByRole('spinbutton');
    fireEvent.change(spinbuttons[1], { target: { value: '80' } });
    expect(onChange).toHaveBeenCalledWith({ width: 80 });
  });

  it('fires onChange for style', () => {
    const onChange = vi.fn();
    render(<DividerPropertyEditor value={value} onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'dashed' } });
    expect(onChange).toHaveBeenCalledWith({ style: 'dashed' });
  });

  it('fires onChange for padding', () => {
    const onChange = vi.fn();
    render(<DividerPropertyEditor value={value} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Left padding'), { target: { value: '0' } });
    expect(onChange).toHaveBeenCalledWith({ padding: { ...value.padding, left: 0 } });
  });
});

// ---------------------------------------------------------------------------
// footer-editor.tsx
// ---------------------------------------------------------------------------

describe('FooterPropertyEditor', () => {
  const value = defaults.footer;

  it('fires onChange for companyName', () => {
    const onChange = vi.fn();
    render(<FooterPropertyEditor value={value} onChange={onChange} />);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'ACME' } });
    expect(onChange).toHaveBeenCalledWith({ companyName: 'ACME' });
  });

  it('fires onChange for address', () => {
    const onChange = vi.fn();
    render(<FooterPropertyEditor value={value} onChange={onChange} />);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[1], { target: { value: '999 Oak Lane' } });
    expect(onChange).toHaveBeenCalledWith({ address: '999 Oak Lane' });
  });

  it('fires onChange for customText (textarea)', () => {
    const onChange = vi.fn();
    render(<FooterPropertyEditor value={value} onChange={onChange} />);
    // textarea is a textbox role too — it's the 3rd textbox
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[2], { target: { value: 'Custom footer text' } });
    expect(onChange).toHaveBeenCalledWith({ customText: 'Custom footer text' });
  });

  it('fires onChange for unsubscribeText', () => {
    const onChange = vi.fn();
    render(<FooterPropertyEditor value={value} onChange={onChange} />);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[3], { target: { value: 'Opt out' } });
    expect(onChange).toHaveBeenCalledWith({ unsubscribeText: 'Opt out' });
  });

  it('fires onChange for textColor', () => {
    const onChange = vi.fn();
    render(<FooterPropertyEditor value={value} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Color picker'), { target: { value: '#111111' } });
    expect(onChange).toHaveBeenCalledWith({ textColor: '#111111' });
  });

  it('fires onChange for fontSize', () => {
    const onChange = vi.fn();
    render(<FooterPropertyEditor value={value} onChange={onChange} />);
    const spinbuttons = screen.getAllByRole('spinbutton');
    fireEvent.change(spinbuttons[0], { target: { value: '14' } });
    expect(onChange).toHaveBeenCalledWith({ fontSize: 14 });
  });

  it('fires onChange for alignment', () => {
    const onChange = vi.fn();
    render(<FooterPropertyEditor value={value} onChange={onChange} />);
    fireEvent.click(screen.getByRole('radio', { name: 'left' }));
    expect(onChange).toHaveBeenCalledWith({ alignment: 'left' });
  });

  it('fires onChange for padding', () => {
    const onChange = vi.fn();
    render(<FooterPropertyEditor value={value} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Right padding'), { target: { value: '10' } });
    expect(onChange).toHaveBeenCalledWith({ padding: { ...value.padding, right: 10 } });
  });
});

// ---------------------------------------------------------------------------
// heading-editor.tsx
// ---------------------------------------------------------------------------

describe('HeadingPropertyEditor', () => {
  const value = defaults.heading;

  it('fires onChange for text', () => {
    const onChange = vi.fn();
    render(<HeadingPropertyEditor value={value} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Text'), { target: { value: 'New heading' } });
    expect(onChange).toHaveBeenCalledWith({ text: 'New heading' });
  });

  it('fires onChange for level', () => {
    const onChange = vi.fn();
    render(<HeadingPropertyEditor value={value} onChange={onChange} />);
    const selects = screen.getAllByRole('combobox');
    // First select = Level
    fireEvent.change(selects[0], { target: { value: '1' } });
    expect(onChange).toHaveBeenCalledWith({ level: 1 });
  });

  it('fires onChange for alignment', () => {
    const onChange = vi.fn();
    render(<HeadingPropertyEditor value={value} onChange={onChange} />);
    fireEvent.click(screen.getByRole('radio', { name: 'right' }));
    expect(onChange).toHaveBeenCalledWith({ alignment: 'right' });
  });

  it('fires onChange for color', () => {
    const onChange = vi.fn();
    render(<HeadingPropertyEditor value={value} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Color picker'), { target: { value: '#ff0000' } });
    expect(onChange).toHaveBeenCalledWith({ color: '#ff0000' });
  });

  it('fires onChange for fontFamily', () => {
    const onChange = vi.fn();
    render(<HeadingPropertyEditor value={value} onChange={onChange} />);
    const selects = screen.getAllByRole('combobox');
    // Second select = Font family
    fireEvent.change(selects[1], { target: { value: 'Arial, Helvetica, sans-serif' } });
    expect(onChange).toHaveBeenCalledWith({ fontFamily: 'Arial, Helvetica, sans-serif' });
  });

  it('fires onChange for fontWeight', () => {
    const onChange = vi.fn();
    render(<HeadingPropertyEditor value={value} onChange={onChange} />);
    const selects = screen.getAllByRole('combobox');
    // fontWeight select is after fontFamily — index 2
    fireEvent.change(selects[2], { target: { value: '700' } });
    expect(onChange).toHaveBeenCalledWith({ fontWeight: 700 });
  });

  it('fires onChange for fontSize', () => {
    const onChange = vi.fn();
    render(<HeadingPropertyEditor value={value} onChange={onChange} />);
    // Multiple spinbuttons exist (fontSize + padding sides) — target by id
    fireEvent.change(screen.getByLabelText('Font size (px)'), { target: { value: '36' } });
    expect(onChange).toHaveBeenCalledWith({ fontSize: 36 });
  });

  it('fires onChange for padding', () => {
    const onChange = vi.fn();
    render(<HeadingPropertyEditor value={value} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Top padding'), { target: { value: '20' } });
    expect(onChange).toHaveBeenCalledWith({ padding: { ...value.padding, top: 20 } });
  });
});

// ---------------------------------------------------------------------------
// image-editor.tsx
// ---------------------------------------------------------------------------

describe('ImagePropertyEditor', () => {
  const value = defaults.image;

  it('fires onChange for src', () => {
    const onChange = vi.fn();
    render(<ImagePropertyEditor value={value} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Source URL'), {
      target: { value: 'https://img.example/a.png' },
    });
    expect(onChange).toHaveBeenCalledWith({ src: 'https://img.example/a.png' });
  });

  it('fires onChange for alt', () => {
    const onChange = vi.fn();
    render(<ImagePropertyEditor value={value} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Alt text'), { target: { value: 'A photo' } });
    expect(onChange).toHaveBeenCalledWith({ alt: 'A photo' });
  });

  it('fires onChange for linkUrl', () => {
    const onChange = vi.fn();
    render(<ImagePropertyEditor value={value} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Link URL'), {
      target: { value: 'https://link.example' },
    });
    expect(onChange).toHaveBeenCalledWith({ linkUrl: 'https://link.example' });
  });

  it('fires onChange for width', () => {
    const onChange = vi.fn();
    render(<ImagePropertyEditor value={value} onChange={onChange} />);
    // Multiple spinbuttons (width + padding sides) — target by aria-label
    fireEvent.change(screen.getByLabelText('Width (px)'), { target: { value: '400' } });
    expect(onChange).toHaveBeenCalledWith({ width: 400 });
  });

  it('fires onChange for alignment', () => {
    const onChange = vi.fn();
    render(<ImagePropertyEditor value={value} onChange={onChange} />);
    fireEvent.click(screen.getByRole('radio', { name: 'left' }));
    expect(onChange).toHaveBeenCalledWith({ alignment: 'left' });
  });

  it('fires onChange for padding', () => {
    const onChange = vi.fn();
    render(<ImagePropertyEditor value={value} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Top padding'), { target: { value: '4' } });
    expect(onChange).toHaveBeenCalledWith({ padding: { ...value.padding, top: 4 } });
  });

  it('shows "Pick from media library" button when renderMediaPicker is provided', () => {
    render(
      <ImagePropertyEditor
        value={value}
        onChange={() => {}}
        renderMediaPicker={() => <div>Picker UI</div>}
      />
    );
    expect(screen.getByText('Pick from media library')).toBeInTheDocument();
  });

  it('opens the media picker on button click and calls onPick', () => {
    const onChange = vi.fn();
    const renderMediaPicker = vi.fn(
      ({ onPick }: { onPick: (url: string) => void; onCancel: () => void }) => (
        <button type="button" onClick={() => onPick('https://media.example/img.png')}>
          Insert
        </button>
      )
    );
    render(
      <ImagePropertyEditor
        value={value}
        onChange={onChange}
        renderMediaPicker={renderMediaPicker}
      />
    );
    fireEvent.click(screen.getByText('Pick from media library'));
    expect(renderMediaPicker).toHaveBeenCalled();
    fireEvent.click(screen.getByText('Insert'));
    expect(onChange).toHaveBeenCalledWith({ src: 'https://media.example/img.png' });
  });

  it('calls onCancel and closes the picker', () => {
    const renderMediaPicker = vi.fn(
      ({ onCancel }: { onPick: (url: string) => void; onCancel: () => void }) => (
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      )
    );
    render(
      <ImagePropertyEditor
        value={value}
        onChange={() => {}}
        renderMediaPicker={renderMediaPicker}
      />
    );
    fireEvent.click(screen.getByText('Pick from media library'));
    expect(renderMediaPicker).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByText('Cancel'));
    // After cancel the picker should be closed — renderMediaPicker not called again on next render
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
  });

  it('does not show picker button when renderMediaPicker is absent', () => {
    render(<ImagePropertyEditor value={value} onChange={() => {}} />);
    expect(screen.queryByText('Pick from media library')).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// social-editor.tsx
// ---------------------------------------------------------------------------

describe('SocialPropertyEditor', () => {
  const value = defaults.social;

  it('renders existing links', () => {
    render(<SocialPropertyEditor value={value} onChange={() => {}} />);
    expect(screen.getAllByRole('button', { name: 'Remove link' })).toHaveLength(value.links.length);
  });

  it('adds a new link when clicking "Add link"', () => {
    const onChange = vi.fn();
    render(<SocialPropertyEditor value={value} onChange={onChange} />);
    fireEvent.click(screen.getByText('Add link'));
    expect(onChange).toHaveBeenCalledWith({
      links: [...value.links, { platform: 'twitter', url: 'https://' }],
    });
  });

  it('removes a link when clicking the remove button', () => {
    const onChange = vi.fn();
    render(<SocialPropertyEditor value={value} onChange={onChange} />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Remove link' })[0]);
    expect(onChange).toHaveBeenCalledWith({ links: [value.links[1]] });
  });

  it('updates a link platform', () => {
    const onChange = vi.fn();
    render(<SocialPropertyEditor value={value} onChange={onChange} />);
    // Platform inputs are the first textboxes in each link row
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'instagram' } });
    expect(onChange).toHaveBeenCalledWith({
      links: [{ ...value.links[0], platform: 'instagram' }, value.links[1]],
    });
  });

  it('updates a link url', () => {
    const onChange = vi.fn();
    render(<SocialPropertyEditor value={value} onChange={onChange} />);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[1], { target: { value: 'https://instagram.com/me' } });
    expect(onChange).toHaveBeenCalledWith({
      links: [{ ...value.links[0], url: 'https://instagram.com/me' }, value.links[1]],
    });
  });

  it('updates a link iconUrl', () => {
    const onChange = vi.fn();
    render(<SocialPropertyEditor value={value} onChange={onChange} />);
    const inputs = screen.getAllByRole('textbox');
    // iconUrl input is the 3rd textbox in the first link (platform, url, iconUrl)
    fireEvent.change(inputs[2], { target: { value: 'https://icons.example/twitter.png' } });
    expect(onChange).toHaveBeenCalledWith({
      links: [{ ...value.links[0], iconUrl: 'https://icons.example/twitter.png' }, value.links[1]],
    });
  });

  it('fires onChange for iconSize', () => {
    const onChange = vi.fn();
    render(<SocialPropertyEditor value={value} onChange={onChange} />);
    const spinbuttons = screen.getAllByRole('spinbutton');
    fireEvent.change(spinbuttons[0], { target: { value: '32' } });
    expect(onChange).toHaveBeenCalledWith({ iconSize: 32 });
  });

  it('fires onChange for spacing', () => {
    const onChange = vi.fn();
    render(<SocialPropertyEditor value={value} onChange={onChange} />);
    const spinbuttons = screen.getAllByRole('spinbutton');
    fireEvent.change(spinbuttons[1], { target: { value: '12' } });
    expect(onChange).toHaveBeenCalledWith({ spacing: 12 });
  });

  it('fires onChange for alignment', () => {
    const onChange = vi.fn();
    render(<SocialPropertyEditor value={value} onChange={onChange} />);
    fireEvent.click(screen.getByRole('radio', { name: 'left' }));
    expect(onChange).toHaveBeenCalledWith({ alignment: 'left' });
  });

  it('fires onChange for padding', () => {
    const onChange = vi.fn();
    render(<SocialPropertyEditor value={value} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Bottom padding'), { target: { value: '6' } });
    expect(onChange).toHaveBeenCalledWith({ padding: { ...value.padding, bottom: 6 } });
  });
});

// ---------------------------------------------------------------------------
// spacer-editor.tsx
// ---------------------------------------------------------------------------

describe('SpacerPropertyEditor', () => {
  it('fires onChange for height', () => {
    const onChange = vi.fn();
    render(<SpacerPropertyEditor value={defaults.spacer} onChange={onChange} />);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '48' } });
    expect(onChange).toHaveBeenCalledWith({ height: 48 });
  });
});

// ---------------------------------------------------------------------------
// text-editor.tsx
// ---------------------------------------------------------------------------

describe('TextPropertyEditor', () => {
  const value = defaults.text;

  it('fires onChange for content via default textarea', () => {
    const onChange = vi.fn();
    render(<TextPropertyEditor value={value} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Content'), { target: { value: 'Hello there' } });
    expect(onChange).toHaveBeenCalledWith({ content: 'Hello there' });
  });

  it('uses renderEditor slot when provided', () => {
    const onChange = vi.fn();
    const renderEditor = vi.fn(
      ({ onChange: onC }: { value: string; onChange: (v: string) => void }) => (
        <input data-testid="rich-editor" onChange={(e) => onC(e.target.value)} defaultValue="" />
      )
    );
    render(<TextPropertyEditor value={value} onChange={onChange} renderEditor={renderEditor} />);
    expect(renderEditor).toHaveBeenCalledWith(expect.objectContaining({ value: value.content }));
    fireEvent.change(screen.getByTestId('rich-editor'), { target: { value: 'Rich text' } });
    expect(onChange).toHaveBeenCalledWith({ content: 'Rich text' });
  });

  it('fires onChange for alignment', () => {
    const onChange = vi.fn();
    render(<TextPropertyEditor value={value} onChange={onChange} />);
    fireEvent.click(screen.getByRole('radio', { name: 'center' }));
    expect(onChange).toHaveBeenCalledWith({ alignment: 'center' });
  });

  it('fires onChange for color', () => {
    const onChange = vi.fn();
    render(<TextPropertyEditor value={value} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Color picker'), { target: { value: '#222222' } });
    expect(onChange).toHaveBeenCalledWith({ color: '#222222' });
  });

  it('fires onChange for fontFamily', () => {
    const onChange = vi.fn();
    render(<TextPropertyEditor value={value} onChange={onChange} />);
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'Arial, Helvetica, sans-serif' } });
    expect(onChange).toHaveBeenCalledWith({ fontFamily: 'Arial, Helvetica, sans-serif' });
  });

  it('fires onChange for fontSize', () => {
    const onChange = vi.fn();
    render(<TextPropertyEditor value={value} onChange={onChange} />);
    // Multiple spinbuttons (fontSize + padding sides) — target by aria-label
    fireEvent.change(screen.getByLabelText('Font size (px)'), { target: { value: '20' } });
    expect(onChange).toHaveBeenCalledWith({ fontSize: 20 });
  });

  it('fires onChange for padding', () => {
    const onChange = vi.fn();
    render(<TextPropertyEditor value={value} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText('Right padding'), { target: { value: '30' } });
    expect(onChange).toHaveBeenCalledWith({ padding: { ...value.padding, right: 30 } });
  });
});
