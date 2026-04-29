import { cloneElement, isValidElement, } from 'react';
import { cn } from './utils.js';
function composeEventHandlers(consumerHandler, medaHandler) {
    if (!consumerHandler)
        return medaHandler;
    if (!medaHandler)
        return consumerHandler;
    return (event) => {
        consumerHandler(event);
        if (!event.defaultPrevented) {
            medaHandler(event);
        }
    };
}
export function renderElement(render, props) {
    if (!isValidElement(render))
        return null;
    const renderProps = render.props;
    const medaProps = props;
    return cloneElement(render, {
        ...renderProps,
        ...medaProps,
        className: cn(renderProps.className, medaProps.className),
        onClick: composeEventHandlers(renderProps.onClick, medaProps.onClick),
        onKeyDown: composeEventHandlers(renderProps.onKeyDown, medaProps.onKeyDown),
    });
}
