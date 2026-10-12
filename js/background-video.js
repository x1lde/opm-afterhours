/**
 * FILE: background-video.js
 * PURPOSE: Presents a muted looping MP4 as decorative, independent visuals.
 * RESPONSIBILITIES: Loads the visual, attempts muted autoplay, retains static
 * artwork on failure, and pauses motion for hidden tabs or reduced motion.
 * CONNECTED FILES: main.js supplies data.js's video path. index.html supplies
 * the video, fallback image, and visual-status text. This module never imports
 * player.js, observes the audio, or reads/writes music timestamps or state.
 */

const LOAD_TIMEOUT_MS = 15000;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let initializationPromise = null;
let loadPromise = null;
let video = null;
let fallback = null;
let status = null;
let videoSource = '';
let metadataTimer = null;
let failed = false;
let playPending = false;
let resumeAfterPending = false;

/**
 * Initializes the single decorative video exactly once, independent of MP3 playback.
 * @param {{videoSrc: string}} song Track configuration; only videoSrc is read.
 * @returns {Promise<void>} Resolves after setup/source checks; errors use fallback.
 */
export function initializeBackgroundVideo(song) {
  if (!initializationPromise) {
    video = document.getElementById('background-video');
    fallback = document.getElementById('background-fallback');
    status = document.getElementById('background-status');
    videoSource = song.videoSrc;
    video.defaultMuted = true;
    keepVideoSilent();
    video.loop = true;
    bindBackgroundEvents();
    initializationPromise = refreshBackground();
  }
  return initializationPromise;
}

/** Keeps both mute and zero volume enforced, even if a browser changes mute state. */
function keepVideoSilent() {
  if (!video.muted) video.muted = true;
  if (video.volume !== 0) video.volume = 0;
}

/** Attaches visual events only; none of these handlers publish music state. */
function bindBackgroundEvents() {
  video.addEventListener('volumechange', keepVideoSilent);
  video.addEventListener('loadedmetadata', () => {
    clearTimeout(metadataTimer);
    refreshBackground();
  });
  video.addEventListener('playing', () => {
    if (!motionAllowed() || failed) {
      video.pause();
      return;
    }
    video.hidden = false;
    fallback.hidden = true;
    setVisualStatus('Muted looping visuals');
  });
  video.addEventListener('waiting', () => {
    if (motionAllowed()) showFallback('Visuals buffering · music is unaffected');
  });
  video.addEventListener('error', () => failVisuals('Video unavailable · static artwork'));
  document.addEventListener('visibilitychange', refreshBackground);
  reducedMotion.addEventListener('change', refreshBackground);
  window.addEventListener('pagehide', () => video.pause());
  window.addEventListener('pageshow', refreshBackground);
}

/** Returns whether document visibility and motion preferences permit decoration. */
function motionAllowed() {
  return !document.hidden && !reducedMotion.matches;
}

/** Applies only page/motion preferences; never checks the MP3's playback state. */
async function refreshBackground() {
  if (!motionAllowed()) {
    resumeAfterPending = false;
    video.pause();
    showFallback(reducedMotion.matches ? 'Static artwork · reduced motion' : 'Visuals paused while tab is hidden');
    return;
  }
  if (failed) return;
  // Delay fetching the MP4 when motion is disabled or the document is hidden.
  if (!loadPromise) loadPromise = loadBackgroundSource();
  await loadPromise;
  if (motionAllowed() && !failed && video.readyState >= HTMLMediaElement.HAVE_METADATA) {
    await attemptMutedPlayback();
  }
}

/** Checks and loads the MP4 once; its failure cannot disable any audio controls. */
async function loadBackgroundSource() {
  const request = new AbortController();
  const timeout = setTimeout(() => request.abort(), LOAD_TIMEOUT_MS);
  try {
    if (!videoSource) {
      failVisuals('No background video configured · static artwork');
      return;
    }
    const response = await fetch(videoSource, { method: 'HEAD', signal: request.signal });
    if (!response.ok && ![405, 501].includes(response.status)) {
      failVisuals('Background video missing or inaccessible · static artwork');
      return;
    }
    metadataTimer = setTimeout(() => failVisuals('Visuals could not load · static artwork'), LOAD_TIMEOUT_MS);
    video.src = videoSource;
    video.load();
  } catch {
    failVisuals('Background video could not load · static artwork');
  } finally {
    clearTimeout(timeout);
  }
}

/** Attempts muted autoplay without a user gesture and catches browser refusals. */
async function attemptMutedPlayback() {
  if (failed || !motionAllowed()) return;
  if (playPending) {
    // A quick tab/preference change may interrupt an unresolved play request.
    // Remember one later attempt instead of adding timers or duplicate requests.
    resumeAfterPending = true;
    return;
  }
  playPending = true;
  keepVideoSilent();
  try {
    await video.play();
    if (!motionAllowed()) video.pause();
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      resumeAfterPending = false;
      showFallback('Static artwork · visual autoplay blocked');
    } else if (error.name !== 'AbortError') {
      failVisuals('Video playback unavailable · static artwork');
    }
  } finally {
    playPending = false;
    if (resumeAfterPending) {
      resumeAfterPending = false;
      if (video.paused && motionAllowed() && !failed) attemptMutedPlayback();
    }
  }
}

/**
 * Displays supplied static artwork without touching the music player.
 * @param {string} message A visual-only status message.
 */
function showFallback(message) {
  video.hidden = true;
  fallback.hidden = false;
  setVisualStatus(message);
}

/**
 * Stops failed visuals and their load timer; audio can still play normally.
 * @param {string} message A visual-only failure explanation.
 */
function failVisuals(message) {
  failed = true;
  clearTimeout(metadataTimer);
  video.pause();
  showFallback(message);
}

/**
 * Updates visual status only when its text changes.
 * @param {string} message A status concerning visuals, never music playback.
 */
function setVisualStatus(message) {
  if (status.textContent !== message) status.textContent = message;
}
