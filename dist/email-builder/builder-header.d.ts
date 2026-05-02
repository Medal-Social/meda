import type { DevicePreview, EmailBuilderLabels } from './types.js';
interface BuilderHeaderProps {
    device: DevicePreview;
    onDeviceChange: (next: DevicePreview) => void;
    onExport: () => void;
    labels: EmailBuilderLabels;
}
export declare function BuilderHeader({ device, onDeviceChange, onExport, labels }: BuilderHeaderProps): import("react/jsx-runtime").JSX.Element;
export {};
