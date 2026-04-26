export interface InspectorJSONProps {
    data: unknown;
    /** Indent size in spaces. */
    indent?: number;
    className?: string;
}
export declare function InspectorJSON({ data, indent, className }: InspectorJSONProps): import("react/jsx-runtime").JSX.Element;
