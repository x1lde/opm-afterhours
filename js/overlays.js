/**
 * FILE: overlays.js
 * PURPOSE: Shares modal exclusivity and keyboard containment across discovery views.
 * RESPONSIBILITIES: Closes the other view before opening and traps Tab/Escape.
 * CONNECTED FILES: search/favorites-view register closers; main/header guard navigation.
 */

const closers = new Map();

export function registerOverlay(id, close) { closers.set(id, close); }

/** Closes other modals through their own cleanup/focus code without resetting filters. */
export function prepareOverlay(id) {
  for (const [otherId, close] of closers) if (otherId !== id) close();
}

export function isOverlayOpen() { return !!document.querySelector('dialog[open]'); }

/** Keeps keyboard focus in the current modal; Escape invokes its normal close flow. */
export function containModalFocus(dialog, event, close) {
  if (event.key === 'Escape') { event.preventDefault(); close(); return; }
  if (event.key !== 'Tab') return;
  const elements = [...dialog.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href], [tabindex="0"]')]
    .filter(element => element.getClientRects().length > 0);
  const first = elements[0];
  const last = elements.at(-1);
  if (!first) { event.preventDefault(); return; }
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}
