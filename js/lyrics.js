/**
 * FILE: lyrics.js
 * PURPOSE: Highlights and centers timestamped lyrics using existing media state.
 * RESPONSIBILITIES: Renders one track's lines, follows time and seeks, suspends
 * following for manual scrolling, and handles missing lyrics and reduced motion.
 * CONNECTED FILES: main.js supplies data.js's demo lines. player.js provides the
 * MP3 playback subscription; index.html and CSS provide the existing panel.
 */

import { subscribeToPlaybackState } from './player.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let initialized = false;
let ui = null;
let trackId = null;
let lyricData = [];
let lineElements = [];
let activeIndex = -1;
let following = true;
let latestPlayback = null;

/** Initializes one panel subscription and one set of user-interaction listeners. */
export function initializeLyrics() {
  if (initialized) return;
  initialized = true;
  ui = {
    panel: document.getElementById('lyrics-scroll'),
    list: document.getElementById('lyric-lines'),
    fallback: document.getElementById('lyrics-fallback'),
    followButton: document.getElementById('follow-lyrics'),
    followStatus: document.getElementById('lyrics-follow-status'),
  };
  ui.panel.addEventListener('wheel', suspendFollowing, { passive: true });
  ui.panel.addEventListener('touchmove', suspendFollowing, { passive: true });
  ui.panel.addEventListener('keydown', handleScrollKey);
  ui.panel.addEventListener('pointerdown', handleScrollbarPress);
  ui.followButton.addEventListener('click', () => {
    setFollowing(!following);
    if (following) centerActiveLine();
  });
  // A growing active line changes its center during the font transition.
  // Recenter once it settles; no timeout or animation loop is necessary.
  ui.list.addEventListener('transitionend', (event) => {
    if (event.propertyName === 'font-size' && event.target === lineElements[activeIndex]) {
      centerActiveLine();
    }
  });
  new ResizeObserver(() => centerActiveLine('auto')).observe(ui.panel);
  reducedMotion.addEventListener('change', () => centerActiveLine('auto'));
  subscribeToPlaybackState(updateLyricsFromPlayback);
}

/**
 * Clears previous content and prepares a new track's lines without switching media.
 * @param {string} songId ID matching the playback controller's current track.
 * @param {Array<{time: number, text: string}>} lines Timestamped text, or an empty array.
 */
export function loadLyricsForTrack(songId, lines = []) {
  initializeLyrics();
  trackId = songId;
  // Keep malformed data out of the renderer; sort a copy without changing song data.
  lyricData = Array.isArray(lines) ? lines
    .filter(line => Number.isFinite(line?.time) && line.time >= 0 && typeof line.text === 'string' && line.text.trim())
    .map(line => ({ time: line.time, text: line.text }))
    .sort((first, second) => first.time - second.time) : [];
  activeIndex = -1;
  lineElements = lyricData.map(line => {
    const element = document.createElement('li');
    element.textContent = line.text;
    return element;
  });
  ui.list.replaceChildren(...lineElements);
  // Stop the old track's smooth movement before resetting the new panel.
  ui.panel.scrollTo({ top: 0, behavior: 'instant' });
  setFollowing(true);
  if (latestPlayback) updateLyricsFromPlayback(latestPlayback);
  else showLyricsAvailability(lyricData.length > 0);
}

/**
 * Uses the MP3 controller's time; unchanged indexes do not trigger DOM updates.
 * @param {object} state A copied playback snapshot from player.js.
 */
function updateLyricsFromPlayback(state) {
  latestPlayback = state;
  const matchingTrack = !state.trackId || state.trackId === trackId;
  const available = lyricData.length > 0 && matchingTrack;
  showLyricsAvailability(available);
  if (!available) {
    setActiveLine(-1);
    return;
  }
  // Buffering retains the current line. A deliberate seek still updates it,
  // including when a buffered player is moved backward or forward.
  if (state.buffering && !state.seeking) return;
  if (state.error) return;
  const time = Number.isFinite(state.currentTime) ? state.currentTime : 0;
  let nextIndex = -1;
  // Reading backward finds the latest timestamp <= time, including exact boundaries.
  // Short lyric arrays make this simple scan inexpensive; no timer is added.
  for (let index = lyricData.length - 1; index >= 0; index--) {
    if (lyricData[index].time <= time) {
      nextIndex = index;
      break;
    }
  }
  setActiveLine(nextIndex);
}

/**
 * Changes only the previous and new active lines, leaving all other nodes intact.
 * @param {number} nextIndex Index of the active line, or -1 before the first timestamp.
 */
function setActiveLine(nextIndex) {
  if (nextIndex === activeIndex) return;
  const previousLine = lineElements[activeIndex];
  if (previousLine) {
    previousLine.classList.remove('is-active');
    previousLine.removeAttribute('aria-current');
  }
  activeIndex = nextIndex;
  const activeLine = lineElements[activeIndex];
  if (activeLine) {
    activeLine.classList.add('is-active');
    activeLine.setAttribute('aria-current', 'true');
  }
  centerActiveLine();
}

/**
 * Scrolls only the panel, using its own coordinates; never scrolls the document.
 * @param {string} behavior Optional auto behavior for resizing; otherwise respects motion preference.
 */
function centerActiveLine(behavior) {
  if (!following || !ui || ui.list.hidden) return;
  const line = lineElements[activeIndex];
  let top = 0;
  if (line) {
    const lineBounds = line.getBoundingClientRect();
    const panelBounds = ui.panel.getBoundingClientRect();
    top = ui.panel.scrollTop + lineBounds.top - panelBounds.top
      + lineBounds.height / 2 - ui.panel.clientHeight / 2;
  }
  ui.panel.scrollTo({ top: Math.max(0, top), behavior: behavior || (reducedMotion.matches ? 'auto' : 'smooth') });
}

/**
 * Shows a quiet fallback and disables following when the current track has no lyrics.
 * @param {boolean} available Whether valid lines exist for the selected track.
 */
function showLyricsAvailability(available) {
  if (ui.list.hidden === available) ui.list.hidden = !available;
  if (ui.fallback.hidden !== available) ui.fallback.hidden = available;
  if (ui.followButton.disabled === available) ui.followButton.disabled = !available;
  const statusText = available ? following ? 'Following' : 'Manual scrolling' : 'No lyrics';
  if (ui.followStatus.textContent !== statusText) ui.followStatus.textContent = statusText;
}

/**
 * Sets follow mode without interrupting music playback or creating a resume timer.
 * @param {boolean} enabled Whether automatic following should be active.
 */
function setFollowing(enabled) {
  following = enabled;
  ui.followButton.setAttribute('aria-pressed', String(enabled));
  showLyricsAvailability(lyricData.length > 0 && (!latestPlayback?.trackId || latestPlayback.trackId === trackId));
}

/** Stops any pending smooth scroll so manual wheel/touch/key input is not opposed. */
function suspendFollowing() {
  if (!following) return;
  setFollowing(false);
  ui.panel.scrollTo({ top: ui.panel.scrollTop, behavior: 'auto' });
}

/**
 * Recognizes keyboard scrolling inside the focusable panel without preventing it.
 * @param {KeyboardEvent} event User key input inside the lyrics region.
 */
function handleScrollKey(event) {
  if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) {
    suspendFollowing();
  }
}

/**
 * Recognizes a scrollbar press while leaving ordinary lyric text clicks alone.
 * @param {PointerEvent} event Pointer input at the panel's right edge.
 */
function handleScrollbarPress(event) {
  if (event.clientX >= ui.panel.getBoundingClientRect().right - 16) suspendFollowing();
}
