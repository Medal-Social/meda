import type { EmailEnvelope } from './types.js';
interface EnvelopeCardProps {
    envelope: EmailEnvelope | undefined;
    onChange: (next: EmailEnvelope) => void;
}
export declare function EnvelopeCard({ envelope, onChange }: EnvelopeCardProps): import("react/jsx-runtime").JSX.Element;
export {};
