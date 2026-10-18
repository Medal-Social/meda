/**
 * What a portal callback answers a form with when it did NOT succeed.
 *
 * The portal's forms ask the same two questions of every failed call: is the
 * session dead (the caller should send the visitor back to the login — the
 * form says nothing), or is there a sentence to show? `message` is optional:
 * without one the form shows its own «could not reach the booking system»
 * label, which is also what a callback that THROWS reads as.
 */
export type PortalActionFailure =
  | { ok: false; kind: 'session' }
  | { ok: false; kind: 'error'; message?: string };

/** A portal callback's answer with no payload on success. */
export type PortalActionResult = { ok: true } | PortalActionFailure;

/**
 * Runs a portal callback and turns a throw into the generic failure, so a
 * form never gets stuck in its pending state on a rejected promise.
 */
export async function settle<T extends { ok: boolean }>(
  run: () => Promise<T>
): Promise<T | PortalActionFailure> {
  try {
    return await run();
  } catch {
    return { ok: false, kind: 'error' };
  }
}

/** The sentence a failure shows, or `null` when it is a dead session. */
export function failureMessage(failure: PortalActionFailure, unreachable: string): string | null {
  if (failure.kind === 'session') return null;
  return failure.message ?? unreachable;
}
