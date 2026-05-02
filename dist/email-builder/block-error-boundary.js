'use client';
import { jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from 'react';
/** Catches render errors inside an individual block so a broken block doesn't tear down the canvas. */
export class BlockErrorBoundary extends Component {
    state = { error: null };
    static getDerivedStateFromError(error) {
        return { error };
    }
    componentDidCatch(_error) {
        // No-op. Consumers can subclass or wrap to add custom logging — we don't
        // want to call console here (and trip the lint rule) in a public package.
    }
    render() {
        if (this.state.error) {
            return (_jsxs("div", { "data-slot": "email-builder-block-error", className: "rounded-md border border-destructive/40 bg-destructive/10 p-3 text-destructive text-sm", role: "alert", children: ["Block failed to render: ", this.state.error.message] }));
        }
        return this.props.children;
    }
}
