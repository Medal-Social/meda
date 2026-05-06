// Render an EmailDocument to email-safe HTML. Adapted from
// apps/web/src/components/email-builder/render-to-email-html.ts. Differences:
//   - No DOMPurify dependency (consumer can re-sanitize the output if desired).
//     Block content is text-escaped at render time; raw HTML is not supported in
//     this surface.
//   - No dark-mode or site-url plumbing.
//   - No `contentSlot`/`html`/`video`/`otp` block kinds (out of scope).
import { getColumnWidths } from './block-registry.js';
import type {
  Alignment,
  ButtonBlockProps,
  DividerBlockProps,
  EmailBlock,
  EmailBrand,
  EmailDocument,
  FooterBlockProps,
  HeadingBlockProps,
  ImageBlockProps,
  SocialBlockProps,
  SpacerBlockProps,
  SpacingValue,
  TextBlockProps,
} from './types.js';

const BUTTON_SIZES: Record<
  'sm' | 'md' | 'lg',
  { paddingX: number; paddingY: number; fontSize: number }
> = {
  sm: { paddingX: 16, paddingY: 8, fontSize: 14 },
  md: { paddingX: 24, paddingY: 12, fontSize: 16 },
  lg: { paddingX: 32, paddingY: 16, fontSize: 18 },
};

export interface RenderToEmailHtmlOptions {
  brand?: EmailBrand;
  /** Override the default content width (px). */
  contentWidth?: number;
  /** Background color of the surrounding email shell. */
  backgroundColor?: string;
  /** Background color of the content table. */
  contentBackgroundColor?: string;
}

export function renderToEmailHtml(
  doc: EmailDocument,
  options: RenderToEmailHtmlOptions = {}
): string {
  const brand = options.brand ?? {};
  const contentWidth = options.contentWidth ?? 600;
  const backgroundColor = options.backgroundColor ?? '#f4f4f4';
  const contentBackgroundColor = options.contentBackgroundColor ?? '#ffffff';
  const fontFamily =
    brand.fontBody ??
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  const textColor = '#111827';
  const preheader = doc.envelope?.preheader ?? '';
  const subject = doc.envelope?.subject ?? '';

  const body = doc.blocks.map((b) => renderBlock(b, brand, contentWidth)).join('\n');

  return `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>${esc(subject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${esc(backgroundColor)}; font-family: ${esc(fontFamily)}; color: ${esc(textColor)};">
  ${preheader ? `<div style="display:none;visibility:hidden;mso-hide:all;font-size:1px;color:${esc(backgroundColor)};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${esc(preheader)}</div>` : ''}
  <table cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${esc(backgroundColor)};">
    <tr>
      <td align="center" valign="top">
        <table cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${esc(contentBackgroundColor)}; max-width: ${contentWidth}px; margin: 0 auto;">
${body}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function renderBlock(block: EmailBlock, brand: EmailBrand, contentWidth: number): string {
  switch (block.kind) {
    case 'heading':
      return renderHeading(block.props as HeadingBlockProps, brand);
    case 'text':
      return renderText(block.props as TextBlockProps, brand);
    case 'image':
      return renderImage(block.props as ImageBlockProps);
    case 'button':
      return renderButton(block.props as ButtonBlockProps, brand);
    case 'divider':
      return renderDivider(block.props as DividerBlockProps);
    case 'spacer':
      return renderSpacer(block.props as SpacerBlockProps);
    case 'columns':
      return renderColumns(block as EmailBlock<'columns'>, brand, contentWidth);
    case 'social':
      return renderSocial(block.props as SocialBlockProps);
    case 'footer':
      return renderFooter(block.props as FooterBlockProps);
    default:
      /* v8 ignore next -- defensive guard; EmailBlock union makes this unreachable at runtime */
      return '';
  }
}

function renderHeading(p: HeadingBlockProps, brand: EmailBrand): string {
  const tag = `h${p.level}`;
  const fontFamily = p.fontFamily || brand.fontHeading || '';
  return `<tr>
  <td style="padding: ${pad(p.padding)}; text-align: ${p.alignment};">
    <${tag} style="margin: 0; color: ${esc(p.color)}; font-size: ${p.fontSize}px; font-weight: ${p.fontWeight}; ${fontFamily ? `font-family: ${esc(fontFamily)};` : ''} line-height: 1.3;">${esc(p.text)}</${tag}>
  </td>
</tr>`;
}

function renderText(p: TextBlockProps, brand: EmailBrand): string {
  const fontFamily = p.fontFamily || brand.fontBody || '';
  // Content is plain text — split paragraphs on blank lines and `<br>` single breaks.
  const escaped = esc(p.content)
    .split(/\n{2,}/)
    .map((para) => `<p style="margin: 0 0 12px 0;">${para.replace(/\n/g, '<br>')}</p>`)
    .join('\n    ');
  return `<tr>
  <td style="padding: ${pad(p.padding)}; text-align: ${p.alignment}; color: ${esc(p.color)}; font-size: ${p.fontSize}px; font-weight: ${p.fontWeight}; ${fontFamily ? `font-family: ${esc(fontFamily)};` : ''} line-height: 1.55; word-break: break-word;">
    ${escaped}
  </td>
</tr>`;
}

function renderImage(p: ImageBlockProps): string {
  if (!p.src) return '';
  const heightAttr = p.height === 'auto' ? '' : ` height="${p.height}"`;
  const img = `<img src="${esc(p.src)}" alt="${esc(p.alt)}" width="${p.width}"${heightAttr} border="0" style="display: block; width: 100%; max-width: ${p.width}px; height: auto;">`;
  const content = p.linkUrl ? `<a href="${esc(p.linkUrl)}">${img}</a>` : img;
  return `<tr>
  <td style="padding: ${pad(p.padding)}; text-align: ${p.alignment};">
    ${wrapAligned(content, p.alignment)}
  </td>
</tr>`;
}

function renderButton(p: ButtonBlockProps, brand: EmailBrand): string {
  const s = BUTTON_SIZES[p.size];
  const bg = p.backgroundColor || brand.brandColor || '#4F46E5';
  const widthAttr = p.fullWidth ? ' width="100%"' : '';
  return `<tr>
  <td style="padding: ${pad(p.padding)};" align="${p.alignment}">
    <table cellspacing="0" cellpadding="0" border="0" align="${p.alignment}"${widthAttr}>
      <tr>
        <td bgcolor="${esc(bg)}" style="background-color: ${esc(bg)}; border-radius: ${p.borderRadius}px; padding: ${s.paddingY}px ${s.paddingX}px; text-align: center;">
          <a href="${esc(p.url)}" style="color: ${esc(p.textColor)}; font-size: ${s.fontSize}px; font-weight: 600; text-decoration: none;">${esc(p.text)}</a>
        </td>
      </tr>
    </table>
  </td>
</tr>`;
}

function renderDivider(p: DividerBlockProps): string {
  return `<tr>
  <td style="padding: ${pad(p.padding)};">
    <table cellspacing="0" cellpadding="0" border="0" width="${p.width}%" align="center">
      <tr>
        <td style="border-top: ${p.thickness}px ${p.style} ${esc(p.color)}; font-size: 0;">&nbsp;</td>
      </tr>
    </table>
  </td>
</tr>`;
}

function renderSpacer(p: SpacerBlockProps): string {
  return `<tr>
  <td height="${p.height}" style="font-size: 0; line-height: 0;">&nbsp;</td>
</tr>`;
}

function renderColumns(
  block: EmailBlock<'columns'>,
  brand: EmailBrand,
  contentWidth: number
): string {
  const p = block.props;
  const widths = getColumnWidths(p.layout);
  const children = block.children ?? [];
  const bg =
    p.backgroundColor !== 'transparent' ? ` background-color: ${esc(p.backgroundColor)};` : '';
  const cells = widths
    .map((width, i) => {
      const colBlocks = (children[i] ?? [])
        .map((b) => renderBlock(b, brand, contentWidth))
        .join('\n');
      const padRight =
        i < widths.length - 1 && p.gap > 0 ? ` style="padding-right: ${p.gap}px;"` : '';
      return `<td valign="${p.verticalAlignment}" width="${Math.round((width / 100) * contentWidth)}"${padRight}>
        <table cellspacing="0" cellpadding="0" border="0" width="100%">
${colBlocks}
        </table>
      </td>`;
    })
    .join('\n');
  return `<tr>
  <td style="padding: ${pad(p.padding)};${bg}">
    <table cellspacing="0" cellpadding="0" border="0" width="100%">
      <tr>
        ${cells}
      </tr>
    </table>
  </td>
</tr>`;
}

function renderSocial(p: SocialBlockProps): string {
  const visible = p.links.filter((l) => Boolean(l.url));
  if (visible.length === 0) return '';
  const cells = visible
    .map(
      (link, i) =>
        `<td${i < visible.length - 1 ? ` style="padding-right: ${p.spacing}px;"` : ''}>
          <a href="${esc(link.url)}" style="text-decoration: none;">
            ${
              link.iconUrl
                ? `<img src="${esc(link.iconUrl)}" alt="${esc(link.platform)}" width="${p.iconSize}" height="${p.iconSize}" border="0" style="display: block;">`
                : `<span style="display: inline-block; padding: 4px 10px; background: #e5e7eb; color: #111827; font-size: 12px; border-radius: 999px;">${esc(link.platform)}</span>`
            }
          </a>
        </td>`
    )
    .join('\n');
  return `<tr>
  <td style="padding: ${pad(p.padding)}; text-align: ${p.alignment};">
    <table cellspacing="0" cellpadding="0" border="0" align="${p.alignment}">
      <tr>${cells}</tr>
    </table>
  </td>
</tr>`;
}

function renderFooter(p: FooterBlockProps): string {
  const lines: string[] = [];
  if (p.companyName) lines.push(esc(p.companyName));
  if (p.address) lines.push(esc(p.address));
  if (p.customText) lines.push(esc(p.customText));
  return `<tr>
  <td style="padding: ${pad(p.padding)}; text-align: ${p.alignment}; color: ${esc(p.textColor)}; font-size: ${p.fontSize}px; line-height: 1.5;">
    ${lines.join('<br>\n    ')}
    ${p.unsubscribeText ? `<br><a href="{{unsubscribeUrl}}" style="color: ${esc(p.textColor)}; text-decoration: underline;">${esc(p.unsubscribeText)}</a>` : ''}
  </td>
</tr>`;
}

// ============================================
// Helpers
// ============================================

function esc(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function pad(p: SpacingValue): string {
  return `${p.top}px ${p.right}px ${p.bottom}px ${p.left}px`;
}

function wrapAligned(content: string, alignment: Alignment): string {
  return `<table cellspacing="0" cellpadding="0" border="0" align="${alignment}">
      <tr><td>${content}</td></tr>
    </table>`;
}
