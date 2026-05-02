import type { DevicePreview } from './types.js';
interface ViewControlsProps {
    device: DevicePreview;
    onDeviceChange: (next: DevicePreview) => void;
    desktopLabel: string;
    mobileLabel: string;
}
/** Toggle between desktop and mobile preview modes. */
export declare function ViewControls({ device, onDeviceChange, desktopLabel, mobileLabel, }: ViewControlsProps): import("react/jsx-runtime").JSX.Element;
export {};
