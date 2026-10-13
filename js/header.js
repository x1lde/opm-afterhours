/**
 * FILE: header.js
 * PURPOSE: Reveals desktop navigation on hover and keeps mobile navigation visible.
 * RESPONSIBILITIES: Shows floating navigation near the top edge, hides it when
 * idle, and preserves hovered/focused content. Touch layouts use a sticky header.
 * CONNECTED FILES: Initialized by main.js; styles live in style.css.
 */

import { isOverlayOpen } from './overlays.js';

const HIDE_DELAY_MS = 2000;

/** Initializes responsive navigation without changing music state. */
export function initializeHeader() {
  const header = document.getElementById('site-header');
  const pullTab = document.getElementById('header-pull-tab');
  const desktop = window.matchMedia('(min-width: 601px) and (hover: hover) and (pointer: fine)');
  let timer;
  let hovered = false;
  let nearTop = false;

  function showHeader() {
    clearTimeout(timer);
    const tabHadFocus = document.activeElement === pullTab;
    header.classList.remove('is-hidden');
    header.inert = false;
    pullTab.hidden = true;
    pullTab.setAttribute('aria-expanded', 'true');
    if (tabHadFocus) header.focus({ preventScroll: true });
    scheduleHide();
  }

  function scheduleHide() {
    clearTimeout(timer);
    if (isOverlayOpen() || !desktop.matches || hovered || nearTop || header.contains(document.activeElement) || document.activeElement === pullTab) return;
    timer = setTimeout(() => {
      if (isOverlayOpen()) return;
      header.classList.add('is-hidden');
      header.inert = true;
      pullTab.hidden = false;
      pullTab.setAttribute('aria-expanded', 'false');
    }, HIDE_DELAY_MS);
  }

  function updateLayout() {
    hovered = false;
    nearTop = false;
    header.classList.toggle('is-floating', desktop.matches);
    showHeader();
  }

  document.addEventListener('pointermove', (event) => {
    if (!desktop.matches || event.pointerType === 'touch') return;
    const wasNearTop = nearTop;
    nearTop = event.clientY <= 24;
    if (nearTop) showHeader();
    else if (wasNearTop) scheduleHide();
  });
  header.addEventListener('pointerenter', () => {
    hovered = true;
    showHeader();
  });
  header.addEventListener('pointerleave', () => {
    hovered = false;
    scheduleHide();
  });
  header.addEventListener('focusin', showHeader);
  header.addEventListener('focusout', () => queueMicrotask(scheduleHide));
  pullTab.addEventListener('pointerenter', showHeader);
  pullTab.addEventListener('pointerleave', scheduleHide);
  pullTab.addEventListener('click', showHeader);
  pullTab.addEventListener('focus', showHeader);
  pullTab.addEventListener('blur', scheduleHide);
  // Reveal navigation when keyboard users enter through the skip link.
  document.querySelector('.skip-link').addEventListener('focus', showHeader);
  desktop.addEventListener('change', updateLayout);
  updateLayout();
}
