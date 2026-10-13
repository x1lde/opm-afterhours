/**
 * FILE: background-video.js
 * PURPOSE: Switches muted decorative video independently of MP3 playback.
 * RESPONSIBILITIES: Cancels old loads, hides old frames immediately, handles
 * autoplay/fallback, visibility, and reduced motion with one set of listeners.
 * CONNECTED FILES: main.js supplies active track data. No player import or clocks.
 */

import { loadArtwork } from './artwork.js';

const LOAD_TIMEOUT_MS = 15000;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let video;
let fallback;
let status;
let initializationPromise;
let version = 0;
let source = null;
let expectedSource = null;
let request;
let loadPromise;
let metadataTimer;
let failed = false;
let playingVersion = null;
let retryAfterPlay = false;

/** Initializes one decorative element and one set of listeners. */
export function initializeBackgroundVideo(song) {
  if (!initializationPromise) {
    video = document.getElementById('background-video');
    fallback = document.getElementById('background-fallback');
    status = document.getElementById('background-status');
    video.defaultMuted = true;
    video.loop = true;
    video.addEventListener('volumechange', keepSilent);
    video.addEventListener('loadedmetadata', () => {
      if (!isCurrentSource() || video.readyState < 1) return;
      clearTimeout(metadataTimer);
      refreshBackground();
    });
    video.addEventListener('playing', () => {
      if (!isCurrentSource() || video.readyState < 2 || !motionAllowed() || failed) {
        video.pause();
        return;
      }
      video.hidden = false;
      fallback.hidden = true;
      status.textContent = 'Muted looping visuals';
    });
    video.addEventListener('waiting', () => {
      if (isCurrentSource()) showFallback('Visuals buffering');
    });
    video.addEventListener('error', () => {
      if (isCurrentSource() && video.error) failVisuals('Video unavailable');
    });
    document.addEventListener('visibilitychange', refreshBackground);
    reducedMotion.addEventListener('change', refreshBackground);
    window.addEventListener('pagehide', () => video.pause());
    window.addEventListener('pageshow', refreshBackground);
    initializationPromise = setBackgroundTrack(song);
  }
  return initializationPromise;
}

/**
 * Clears old frames before assigning any new source. Artwork/video failures affect
 * only decoration, and the MP3's position or paused state is never read here.
 * @param {object} song Catalog track (videoSrc compatibility alias also accepted).
 * @returns {Promise<void>} Setup/source-check completion, independent of audio.
 */
export async function setBackgroundTrack(song) {
  if (!video) return initializeBackgroundVideo(song);
  const current = ++version;
  request?.abort();
  clearTimeout(metadataTimer);
  expectedSource = null;
  failed = false;
  retryAfterPlay = false;
  loadPromise = null;
  source = song.backgroundVideoSrc || song.videoSrc || null;
  video.hidden = true;
  video.pause();
  video.removeAttribute('src');
  video.removeAttribute('poster');
  video.load();
  keepSilent();
  loadArtwork(fallback, song.coverArt, null, () => {
    if (version === current) video.poster = song.coverArt;
    if (!video.hidden) fallback.hidden = true;
  });
  status.textContent = 'Preparing visuals...';
  await refreshBackground();
}

/** Enforces muted, zero-volume decoration even after browser media changes. */
function keepSilent() {
  if (!video.muted) video.muted = true;
  if (video.volume !== 0) video.volume = 0;
}

function motionAllowed() {
  return !document.hidden && !reducedMotion.matches;
}

function isCurrentSource() {
  return expectedSource && (!video.currentSrc || video.currentSrc === expectedSource);
}

/** Reacts only to document visibility and motion preferences. */
async function refreshBackground() {
  const current = version;
  if (!motionAllowed()) {
    video.pause();
    showFallback(reducedMotion.matches ? 'Static artwork - reduced motion' : 'Visuals paused in hidden tab');
    return;
  }
  if (failed) return;
  if (!loadPromise) loadPromise = loadSource(current);
  await loadPromise;
  if (current !== version || failed || !motionAllowed() || video.readyState < 1) return;
  await playMuted(current);
}

/** Checks the selected visual source; aborted/stale requests cannot replace it. */
async function loadSource(current) {
  if (!source) {
    failVisuals('No video supplied - static artwork');
    return;
  }
  const path = source;
  const controller = new AbortController();
  request = controller;
  const timeout = setTimeout(() => controller.abort(), LOAD_TIMEOUT_MS);
  try {
    const response = await fetch(path, { method: 'HEAD', signal: controller.signal });
    if (current !== version) return;
    if (!response.ok && ![405, 501].includes(response.status)) {
      failVisuals('Video unavailable - static artwork');
      return;
    }
    expectedSource = new URL(path, document.baseURI).href;
    video.src = path;
    metadataTimer = setTimeout(() => {
      if (current === version) failVisuals('Visuals could not load');
    }, LOAD_TIMEOUT_MS);
    video.load();
  } catch {
    if (current === version) failVisuals('Video unavailable - static artwork');
  } finally {
    clearTimeout(timeout);
  }
}

/** Stale autoplay promises cannot pause or reveal a later track's decoration. */
async function playMuted(current) {
  if (playingVersion === current) {
    retryAfterPlay = true;
    return;
  }
  playingVersion = current;
  keepSilent();
  try {
    await video.play();
    if (current === version && !motionAllowed()) video.pause();
  } catch (error) {
    if (current !== version) return;
    if (error.name === 'NotAllowedError') showFallback('Static artwork - autoplay blocked');
    else if (error.name !== 'AbortError') failVisuals('Video playback unavailable');
  } finally {
    if (playingVersion === current) playingVersion = null;
    // Visibility can interrupt an unresolved play request; retry only after that
    // request finishes and only when current motion settings permit playback.
    if (current === version && retryAfterPlay) {
      retryAfterPlay = false;
      if (video.paused && motionAllowed() && !failed) refreshBackground();
    }
  }
}

function showFallback(message) {
  video.hidden = true;
  fallback.hidden = !fallback.getAttribute('src');
  status.textContent = message;
}

function failVisuals(message) {
  failed = true;
  clearTimeout(metadataTimer);
  video.pause();
  showFallback(message);
}
