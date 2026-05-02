import type { EmailBrand, EmailDocument } from './types.js';
export interface RenderToEmailHtmlOptions {
    brand?: EmailBrand;
    /** Override the default content width (px). */
    contentWidth?: number;
    /** Background color of the surrounding email shell. */
    backgroundColor?: string;
    /** Background color of the content table. */
    contentBackgroundColor?: string;
}
export declare function renderToEmailHtml(doc: EmailDocument, options?: RenderToEmailHtmlOptions): string;
