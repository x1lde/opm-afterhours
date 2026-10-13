/**
 * FILE: player.js
 * PURPOSE: Uses the MP3 audio element as the sole source of music playback.
 * RESPONSIBILITIES: Switches local tracks on one audio element, reads media metadata,
 * connects play/pause, seeking, and volume, explains media failures, and
 * preserves volume/mute, cancels stale loads, and publishes playback snapshots.
 * CONNECTED FILES: main.js supplies demoSong from data.js. index.html supplies
 * the audio and controls; main.js uses snapshots for vinyl motion and lyrics.js
 * uses audio time for lyrics. The separate background video never changes
 * music state, time, or volume.
 */

const LOAD_TIMEOUT_MS = 15000;
const BUFFER_TIMEOUT_MS = 20000;
const PLAY_ICON = 'm9 5 11 7-11 7z';
const PAUSE_ICON = 'M7 5h4v14H7zM14 5h4v14h-4z';

let audio = null;
let ui = null;
let initializationPromise = null;
let finishLoading = null;
let loadingTimer = null;
let bufferingTimer = null;
let previewingSeek = false;
let loadVersion = 0;
let requestVersion = 0;
let blockedPlaybackMessage = null;
let sourceRequest = null;
let expectedSource = null;
let message = 'Loading local audio…';
const playbackSubscribers = new Set();

// All playback information lives here. Volume uses 0–100 for the UI, while
// HTMLAudioElement.volume uses 0–1. Unknown or infinite duration is represented by 0.
const playbackState = {
  trackId: null,
  status: 'unstarted',
  ready: false,
  currentTime: 0,
  duration: 0,
  volume: 50,
  muted: false,
  seeking: false,
  buffering: false,
  isActivelyPlaying: false,
  selectedSong: null,
  error: null,
};

/**
 * Returns a copy of the latest media state; accepts no parameters.
 * @returns {object} Track ID, status, time/duration in seconds, volume (0–100),
 * seeking/buffering flags, isActivelyPlaying, selected song, and any error message.
 */
export function getPlaybackState() {
  return {
    ...playbackState,
    // A request to play is not enough: media must confirm playing or advance
    // after a seek, with no pause, buffering, seeking, or error in progress.
    isActivelyPlaying: playbackState.isActivelyPlaying && playbackState.ready
      && !playbackState.seeking && !playbackState.buffering && !playbackState.error
      && !!audio && !audio.paused && !audio.ended,
    selectedSong: playbackState.selectedSong ? { ...playbackState.selectedSong } : null,
  };
}

/**
 * Subscribes to the current snapshot immediately and to later media updates.
 * @param {Function} callback Receives a state copy; use isActivelyPlaying for motion.
 * @returns {Function} Call this function to remove the subscription.
 */
export function subscribeToPlaybackState(callback) {
  playbackSubscribers.add(callback);
  callback(getPlaybackState());
  return () => playbackSubscribers.delete(callback);
}

/** Publishes copies so a UI subscriber cannot mutate the controller's state. */
function notifyPlaybackSubscribers() {
  for (const callback of playbackSubscribers) callback(getPlaybackState());
}

/**
 * Initializes the existing audio once; repeated calls reuse the same promise.
 * @param {{id: string, title: string, artist: string, audioSrc: string}} song Local track configuration.
 * @returns {Promise<object>} State after metadata loads or an error is reported.
 */
export function initializePlayer(song) {
  if (!initializationPromise) {
    connectPlayer();
    initializationPromise = loadTrack(song);
  }
  return initializationPromise;
}

/** Connects the existing audio and controls only once, across every track load. */
function connectPlayer() {
  if (audio) return;
  audio = document.getElementById('music-audio');
  ui = {
    playButton: document.getElementById('play-pause'),
    playIcon: document.getElementById('play-pause-icon'),
    progress: document.getElementById('playback-progress'),
    volume: document.getElementById('volume'),
    currentTime: document.getElementById('current-time'),
    duration: document.getElementById('total-duration'),
    status: document.getElementById('player-status'),
  };
  bindAudioEvents();
  bindControls();
  audio.volume = playbackState.volume / 100;
}

/**
 * Checks HTTP availability without changing the current audio. Catalog status alone
 * never proves that a source exists; 405/501 permit a later native decode attempt.
 * @param {object} song Catalog track with supplied-media status.
 * @param {AbortSignal} signal Optional cancellation signal.
 * @returns {Promise<boolean>} Whether a native load may be attempted.
 */
export async function checkTrackAvailability(song, signal) {
  if (!song || !['ready-demo', 'ready'].includes(song.status) || !song.audioSrc) return false;
  const request = new AbortController();
  const abort = () => request.abort();
  signal?.addEventListener('abort', abort, { once: true });
  if (signal?.aborted) request.abort();
  const timeout = setTimeout(abort, LOAD_TIMEOUT_MS);
  try {
    const response = await fetch(song.audioSrc, { method: 'HEAD', signal: request.signal });
    return response.ok || [405, 501].includes(response.status);
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', abort);
  }
}

/**
 * Reuses the sole audio element. Preflight failure leaves the current song intact.
 * A monotonically increasing version rejects old requests, timers, and play errors.
 * @param {object} song Catalog track with the compatibility artist display name.
 * @param {{autoplay?: boolean}} options User track selections request autoplay.
 * @returns {Promise<object>} Latest playback state; compare trackId to detect commit.
 */
export async function loadTrack(song, { autoplay = false } = {}) {
  connectPlayer();
  const requested = ++requestVersion;
  sourceRequest?.abort();
  sourceRequest = new AbortController();
  if (song?.id === playbackState.trackId && playbackState.ready) return getPlaybackState();
  const available = await checkTrackAvailability(song, sourceRequest.signal);
  if (requested !== requestVersion) return getPlaybackState();
  if (!available) {
    if (!playbackState.trackId) {
      playbackState.selectedSong = song;
      showError('Audio unavailable. Supply the authorized MP3 and check its catalog status.');
    }
    return getPlaybackState();
  }

  const version = ++loadVersion;
  blockedPlaybackMessage = null;

  // Finish an abandoned load before resetting. No old timer can change this load.
  finishLoading?.();
  clearTimeout(loadingTimer);
  clearBufferTimeout();
  expectedSource = null;
  audio.pause();
  audio.removeAttribute('src');
  audio.load();
  Object.assign(playbackState, {
    trackId: song.id, selectedSong: { ...song }, status: 'loading', ready: false,
    currentTime: 0, duration: 0, seeking: false, buffering: false,
    isActivelyPlaying: false, error: null,
  });
  previewingSeek = false;
  message = `Loading ${song.title}...`;
  renderControls();
  expectedSource = new URL(song.audioSrc, document.baseURI).href;
  audio.src = song.audioSrc;
  const loaded = new Promise(resolve => {
    finishLoading = () => {
      clearTimeout(loadingTimer);
      finishLoading = null;
      resolve(getPlaybackState());
    };
    loadingTimer = setTimeout(() => {
      if (version === loadVersion) showError('Audio metadata did not load. Check the recording and try again.');
    }, LOAD_TIMEOUT_MS);
  });
  audio.load();
  if (autoplay) {
    // Calling play during loading retains the user-initiated intent. Native playing
    // confirms success; a browser refusal leaves controls available to retry.
    playAudio(version);
  }
  await loaded;
  return getPlaybackState();
}

/** Handles play rejections only for the currently requested track. */
async function playAudio(version = loadVersion) {
  try {
    await audio.play();
  } catch (error) {
    if (version !== loadVersion || error.name === 'AbortError') return;
    if (error.name === 'NotAllowedError') {
      audio.pause();
      blockedPlaybackMessage = 'Playback blocked. Press Play to listen.';
      showError(blockedPlaybackMessage, false);
    } else {
      showError('Audio playback failed. Check the recording or choose another available track.');
    }
  }
}

/** Cancels a not-yet-committed selection without interrupting active media loading. */
export function cancelPendingTrackSelection() {
  requestVersion++;
  sourceRequest?.abort();
}

/** Attaches each media listener once; there are no polling loops or new players. */
function bindAudioEvents() {
  const events = [
    'loadedmetadata', 'durationchange', 'play', 'playing', 'pause', 'waiting',
    'timeupdate', 'seeking', 'seeked', 'ended', 'volumechange', 'error', 'stalled',
  ];
  for (const eventName of events) audio.addEventListener(eventName, handleAudioEvent);
}

/**
 * Reads native audio events; background-video events never enter this handler.
 * @param {Event} event A media event from the single HTMLAudioElement.
 */
function handleAudioEvent(event) {
  // Events queued by a removed source must not publish old metadata or timestamps.
  if (!expectedSource || (audio.currentSrc && audio.currentSrc !== expectedSource)) return;
  if (event.type === 'loadedmetadata' && (audio.readyState < 1 || !Number.isFinite(audio.duration))) return;
  if (event.type === 'error' && !audio.error) return;
  if (!playbackState.ready && !['loadedmetadata', 'playing', 'error', 'volumechange'].includes(event.type)) return;
  if (event.type === 'error') {
    const errors = {
      1: 'Audio loading was interrupted. Reload the page to try again.',
      2: 'The audio connection failed. Check Live Server and reload.',
      3: 'The audio could not be decoded. Replace the corrupted file with a compatible MP3.',
      4: 'This media format is unsupported. Use a compatible MP3 audio file.',
    };
    showError(errors[audio.error?.code] || 'The audio is unavailable. Check the file path and MP3 format.');
    return;
  }
  const previousTime = playbackState.currentTime;
  readMediaValues();

  switch (event.type) {
    case 'loadedmetadata':
      playbackState.isActivelyPlaying = false;
      playbackState.ready = true;
      playbackState.error = blockedPlaybackMessage;
      playbackState.status = audio.paused ? 'paused' : 'starting';
      message = blockedPlaybackMessage || (audio.paused ? 'Ready - press Play to listen' : 'Starting playback...');
      finishLoading?.();
      break;
    case 'play':
      playbackState.isActivelyPlaying = false;
      // play means playback was requested; playing confirms media is advancing.
      playbackState.status = 'starting';
      playbackState.error = null;
      message = 'Starting playback…';
      beginBufferTimeout();
      break;
    case 'playing':
      blockedPlaybackMessage = null;
      playbackState.isActivelyPlaying = true;
      playbackState.ready = true;
      playbackState.status = 'playing';
      playbackState.buffering = false;
      playbackState.error = null;
      message = 'Playing · local audio';
      clearBufferTimeout();
      break;
    case 'pause':
      playbackState.isActivelyPlaying = false;
      playbackState.buffering = false;
      clearBufferTimeout();
      if (!playbackState.error || playbackState.ready) {
        playbackState.error = null;
        playbackState.status = audio.ended ? 'ended' : 'paused';
        message = audio.ended ? 'Audio ended · press Play to replay' : 'Paused';
      }
      break;
    case 'waiting':
    case 'stalled':
      playbackState.isActivelyPlaying = false;
      if (!audio.paused && !playbackState.error) {
        playbackState.status = 'buffering';
        playbackState.buffering = true;
        message = 'Buffering · waiting for audio data';
        beginBufferTimeout();
      }
      break;
    case 'seeking':
      playbackState.isActivelyPlaying = false;
      playbackState.seeking = true;
      if (!playbackState.error) {
        playbackState.status = 'seeking';
        message = 'Seeking…';
        beginBufferTimeout();
      }
      break;
    case 'seeked':
      playbackState.isActivelyPlaying = false;
      playbackState.seeking = false;
      playbackState.buffering = !audio.paused && audio.readyState < HTMLMediaElement.HAVE_FUTURE_DATA;
      clearBufferTimeout();
      if (!playbackState.error) {
        playbackState.status = audio.ended ? 'ended' : audio.paused ? 'paused' : playbackState.buffering ? 'buffering' : 'playing';
        message = playbackState.buffering ? 'Buffering · waiting for audio data' : audio.paused ? 'Paused' : 'Playing · local audio';
        if (playbackState.buffering) beginBufferTimeout();
      }
      break;
    case 'timeupdate':
      // Some browsers resume after seeking without another playing event.
      // Actual forward progress confirms recovery; the seek jump alone does not.
      if (playbackState.status === 'playing' && playbackState.currentTime > previousTime
          && !audio.paused && !audio.seeking && !playbackState.buffering
          && audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
        playbackState.isActivelyPlaying = true;
      }
      break;
    case 'ended':
      playbackState.isActivelyPlaying = false;
      playbackState.status = 'ended';
      playbackState.buffering = false;
      playbackState.seeking = false;
      message = 'Audio ended · press Play to replay';
      clearBufferTimeout();
      break;
  }
  renderControls();
}

/** Connects custom controls; native control changes come back through events. */
function bindControls() {
  ui.playButton.addEventListener('click', togglePlayback);
  ui.progress.addEventListener('input', () => {
    previewingSeek = true;
    ui.progress.setAttribute('aria-valuetext', `Seek to ${formatTime(Number(ui.progress.value))}`);
  });
  ui.progress.addEventListener('change', seekFromControl);
  ui.progress.addEventListener('pointercancel', () => {
    previewingSeek = false;
    renderControls();
  });
  ui.volume.addEventListener('input', () => {
    if (!playbackState.ready) return;
    audio.volume = Math.min(1, Math.max(0, Number(ui.volume.value) / 100));
    if (audio.volume > 0) audio.muted = false;
    // volumechange will read the actual result and synchronize the UI.
  });
}

/** Sends play/pause from a user click and handles a rejected play() promise. */
async function togglePlayback() {
  if (!playbackState.ready) return;
  if (!audio.paused && !audio.ended) {
    audio.pause();
    return;
  }
  await playAudio();
}

/** Applies the slider position in seconds; unknown duration keeps seeking disabled. */
function seekFromControl() {
  previewingSeek = false;
  if (!playbackState.ready || playbackState.duration <= 0) return;
  try {
    audio.currentTime = Math.min(playbackState.duration, Math.max(0, Number(ui.progress.value)));
    readMediaValues();
    renderControls();
  } catch {
    showError('Seeking is unavailable. Reload the page to try again.', false);
  }
}

/** Reads time, finite duration, volume, mute, and seeking directly from the audio. */
function readMediaValues() {
  playbackState.currentTime = Number.isFinite(audio.currentTime) ? Math.max(0, audio.currentTime) : 0;
  playbackState.duration = Number.isFinite(audio.duration) ? Math.max(0, audio.duration) : 0;
  playbackState.volume = Math.round(audio.volume * 100);
  playbackState.muted = audio.muted;
  playbackState.seeking = audio.seeking;
}

/** Updates playback controls and notifies components without styling them here. */
function renderControls() {
  const playing = !audio.paused && !audio.ended && playbackState.ready;
  ui.playButton.disabled = !playbackState.ready;
  ui.volume.disabled = !playbackState.ready;
  ui.progress.disabled = !playbackState.ready || playbackState.duration <= 0;
  ui.playButton.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} ${playbackState.selectedSong?.title || 'track'}`);
  ui.playIcon.setAttribute('d', playing ? PAUSE_ICON : PLAY_ICON);
  ui.currentTime.textContent = playbackState.ready ? formatTime(playbackState.currentTime) : '--:--';
  ui.duration.textContent = playbackState.duration > 0 ? formatTime(playbackState.duration) : '--:--';
  // Artist browsing replaces cards, so never retain a reference to an old card.
  const songDuration = document.getElementById('selected-song-duration');
  if (songDuration) songDuration.textContent = ui.duration.textContent;
  ui.currentTime.setAttribute('aria-label', `Current time ${ui.currentTime.textContent}`);
  ui.duration.setAttribute('aria-label', `Total duration ${ui.duration.textContent}`);
  if (!previewingSeek) {
    ui.progress.max = playbackState.duration || 100;
    ui.progress.value = playbackState.currentTime;
    ui.progress.setAttribute('aria-valuetext', `${formatTime(playbackState.currentTime)} of ${ui.duration.textContent}`);
  }
  ui.volume.value = playbackState.muted ? 0 : playbackState.volume;
  ui.volume.setAttribute('aria-valuetext', playbackState.muted ? 'Muted' : `${playbackState.volume}%`);
  if (ui.status.textContent !== message) ui.status.textContent = message;
  notifyPlaybackSubscribers();
}

/** Starts a finite warning timer without pretending playback has succeeded. */
function beginBufferTimeout() {
  if (bufferingTimer) return;
  bufferingTimer = setTimeout(() => {
    bufferingTimer = null;
    message = 'Audio data is taking longer than expected. Check Live Server or reload the page.';
    renderControls();
  }, BUFFER_TIMEOUT_MS);
}

/** Clears the pending buffer warning when playback resumes, pauses, or ends. */
function clearBufferTimeout() {
  clearTimeout(bufferingTimer);
  bufferingTimer = null;
}

/**
 * Reports a media failure below the audio without covering it.
 * @param {string} errorMessage A readable explanation and recovery action.
 * @param {boolean} fatal Whether to disable controls (false allows another try).
 */
function showError(errorMessage, fatal = true) {
  playbackState.isActivelyPlaying = false;
  playbackState.status = fatal ? 'error' : audio.ended ? 'ended' : audio.paused ? 'paused' : 'playing';
  playbackState.error = errorMessage;
  playbackState.buffering = false;
  playbackState.seeking = false;
  if (fatal) {
    playbackState.ready = false;
    audio.pause();
  }
  previewingSeek = false;
  clearBufferTimeout();
  clearTimeout(loadingTimer);
  message = errorMessage;
  renderControls();
  finishLoading?.();
}

/**
 * Formats actual seconds as M:SS or H:MM:SS; accepts unknown time safely.
 * @param {number} seconds Time in seconds from the audio or seek preview.
 * @returns {string} A readable playback clock.
 */
function formatTime(seconds) {
  const total = Number.isFinite(seconds) ? Math.floor(Math.max(0, seconds)) : 0;
  const minutes = Math.floor(total / 60);
  const remainder = String(total % 60).padStart(2, '0');
  if (minutes < 60) return `${minutes}:${remainder}`;
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}:${remainder}`;
}
