import {
  cloneElement,
  isValidElement,
  type KeyboardEventHandler,
  type MouseEventHandler,
  type ReactElement,
  type ReactNode,
} from 'react';
import { cn } from './utils.js';

export type RenderElement<TProps extends { className?: string; children?: ReactNode }> =
  ReactElement<Partial<TProps>>;

type EventProps = {
  onClick?: MouseEventHandler<HTMLElement>;
  onKeyDown?: KeyboardEventHandler<HTMLElement>;
};

function composeEventHandlers<Event extends { defaultPrevented: boolean }>(
  consumerHandler: ((event: Event) => void) | undefined,
  medaHandler: ((event: Event) => void) | undefined
) {
  if (!consumerHandler) return medaHandler;
  if (!medaHandler) return consumerHandler;

  return (event: Event) => {
    consumerHandler(event);
    if (!event.defaultPrevented) {
      medaHandler(event);
    }
  };
}

export function renderElement<TProps extends { className?: string; children?: ReactNode }>(
  render: RenderElement<TProps>,
  props: TProps
): ReactNode {
  if (!isValidElement(render)) return null;

  const renderProps = render.props as Partial<TProps> & EventProps;
  const medaProps = props as TProps & EventProps;

  return cloneElement(render, {
    ...renderProps,
    ...medaProps,
    className: cn(renderProps.className, medaProps.className),
    onClick: composeEventHandlers(renderProps.onClick, medaProps.onClick),
    onKeyDown: composeEventHandlers(renderProps.onKeyDown, medaProps.onKeyDown),
  } as Partial<TProps>);
}
