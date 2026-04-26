export interface VoiceLevelProps {
    level: number;
    variant?: 'bars' | 'wave' | 'ring';
    width?: number;
    height?: number;
    className?: string;
}
export declare function VoiceLevel({ level, variant, width, height, className, }: VoiceLevelProps): import("react/jsx-runtime").JSX.Element;
