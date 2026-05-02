import { Component, type ReactNode } from 'react';
interface Props {
    blockId: string;
    children: ReactNode;
}
interface State {
    error: Error | null;
}
/** Catches render errors inside an individual block so a broken block doesn't tear down the canvas. */
export declare class BlockErrorBoundary extends Component<Props, State> {
    state: State;
    static getDerivedStateFromError(error: Error): State;
    componentDidCatch(_error: Error): void;
    render(): ReactNode;
}
export {};
