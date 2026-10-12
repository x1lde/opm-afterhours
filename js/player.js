/**
 * FILE: player.js
 * PURPOSE: Uses the MP3 audio element as the sole source of music playback.
 * RESPONSIBILITIES: Loads one local track, reads media events and metadata,
 * connects play/pause, seeking, and volume, explains media failures, and
 * publishes playback snapshots for independent UI components.
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
  if (!initializationPromise) initializationPromise = loadLocalAudio(song);
  return initializationPromise;
}

/**
 * Connects the DOM and checks the configured file before assigning the source.
 * @param {object} song Track data from data.js; duration is not part of the data.
 * @returns {Promise<object>} Initial playback snapshot, including any failure.
 */
async function loadLocalAudio(song) {
  audio = document.getElementById('music-audio');
  ui = {
    playButton: document.getElementById('play-pause'),
    playIcon: document.getElementById('play-pause-icon'),
    progress: document.getElementById('playback-progress'),
    volume: document.getElementById('volume'),
    currentTime: document.getElementById('current-time'),
    duration: document.getElementById('total-duration'),
    songDuration: document.getElementById('selected-song-duration'),
    status: document.getElementById('player-status'),
  };
  playbackState.trackId = song.id;
  playbackState.selectedSong = { ...song };
  playbackState.status = 'loading';
  bindAudioEvents();
  bindControls();
  audio.volume = playbackState.volume / 100;
  renderControls();

  // HEAD checks availability without downloading the MP3 twice. A missing file
  // gets a precise path message instead of the browser's ambiguous codec error.
  const requestController = new AbortController();
  const requestTimeout = setTimeout(() => requestController.abort(), LOAD_TIMEOUT_MS);
  try {
    if (!song.id || !song.audioSrc) throw new Error('Configure the track ID and audioSrc in js/data.js.');
    const response = await fetch(song.audioSrc, { method: 'HEAD', signal: requestController.signal });
    if (response.status === 404) {
      throw new Error(`Audio file missing. Add an authorized MP3 at ${song.audioSrc}, then reload.`);
    }
    // Some static servers do not support HEAD; allow the audio to try loading.
    if (!response.ok && ![405, 501].includes(response.status)) {
      throw new Error('The audio file could not be opened. Check its permissions and restart Live Server.');
    }
  } catch (error) {
    showError(error.name === 'AbortError'
      ? 'Loading timed out. Check that Live Server is running and the audio file is accessible, then reload.'
      : error.message || 'The local audio could not load. Check Live Server and reload.');
    return getPlaybackState();
  } finally {
    clearTimeout(requestTimeout);
  }

  return new Promise((resolve) => {
    finishLoading = () => {
      clearTimeout(loadingTimer);
      finishLoading = null;
      resolve(getPlaybackState());
    };
    loadingTimer = setTimeout(() => {
      showError('Audio metadata did not load. Check the MP3 format and file, then reload.');
    }, LOAD_TIMEOUT_MS);
    try {
      audio.src = song.audioSrc;
      audio.load();
    } catch {
      showError('The audio could not initialize. Check its path and reload the page.');
    }
  });
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
      playbackState.error = null;
      playbackState.status = 'paused';
      message = 'Ready · press Play to listen';
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
  try {
    await audio.play();
  } catch (error) {
    if (error.name === 'AbortError' && audio.paused) return;
    if (error.name === 'NotAllowedError') {
      showError('Your browser blocked playback. Press Play to try again, and check browser playback permissions.', false);
    } else if (error.name === 'NotSupportedError') {
      showError('This media format is unsupported. Use a compatible MP3 audio file.');
    } else {
      showError('Playback failed. Try Play again or reload the page.', false);
    }
  }
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
  ui.playButton.setAttribute('aria-label', `${playing ? 'Pause' : 'Play'} ${playbackState.selectedSong.title}`);
  ui.playIcon.setAttribute('d', playing ? PAUSE_ICON : PLAY_ICON);
  ui.currentTime.textContent = playbackState.ready ? formatTime(playbackState.currentTime) : '--:--';
  ui.duration.textContent = playbackState.duration > 0 ? formatTime(playbackState.duration) : '--:--';
  ui.songDuration.textContent = ui.duration.textContent;
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
