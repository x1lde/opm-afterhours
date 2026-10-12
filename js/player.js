/**
 * FILE: player.js
 * PURPOSE: Controls the existing HTML5 video element and custom playback UI.
 * RESPONSIBILITIES: Loads one local track, reads media events and metadata,
 * connects play/pause, seeking, and volume, explains media failures, and
 * publishes playback snapshots for independent UI components.
 * CONNECTED FILES: main.js supplies demoSong from data.js. index.html supplies
 * the video and controls; CSS preserves the approved layout. Future vinyl and
 * lyrics features can read or subscribe to state without a second controller.
 */

const LOAD_TIMEOUT_MS = 15000;
const BUFFER_TIMEOUT_MS = 20000;
const PLAY_ICON = 'm9 5 11 7-11 7z';
const PAUSE_ICON = 'M7 5h4v14H7zM14 5h4v14h-4z';

let video = null;
let ui = null;
let initializationPromise = null;
let finishLoading = null;
let loadingTimer = null;
let bufferingTimer = null;
let previewingSeek = false;
let message = 'Loading local video…';
const playbackSubscribers = new Set();

// All playback information lives here. Volume uses 0–100 for the UI, while
// HTMLVideoElement.volume uses 0–1. Unknown or infinite duration is represented by 0.
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
      && !!video && !video.paused && !video.ended,
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
 * Initializes the existing video once; repeated calls reuse the same promise.
 * @param {{id: string, title: string, artist: string, videoSrc: string, posterSrc?: string}} song Local track configuration.
 * @returns {Promise<object>} State after metadata loads or an error is reported.
 */
export function initializePlayer(song) {
  if (!initializationPromise) initializationPromise = loadLocalVideo(song);
  return initializationPromise;
}

/**
 * Connects the DOM and checks the configured file before assigning the source.
 * @param {object} song Track data from data.js; duration is not part of the data.
 * @returns {Promise<object>} Initial playback snapshot, including any failure.
 */
async function loadLocalVideo(song) {
  video = document.getElementById('music-video');
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
  bindVideoEvents();
  bindControls();
  video.volume = playbackState.volume / 100;
  renderControls();

  // HEAD checks availability without downloading the MP4 twice. A missing file
  // gets a precise path message instead of the browser's ambiguous codec error.
  const requestController = new AbortController();
  const requestTimeout = setTimeout(() => requestController.abort(), LOAD_TIMEOUT_MS);
  try {
    if (!song.id || !song.videoSrc) throw new Error('Configure the track ID and videoSrc in js/data.js.');
    const response = await fetch(song.videoSrc, { method: 'HEAD', signal: requestController.signal });
    if (response.status === 404) {
      throw new Error(`Video file missing. Add an authorized MP4 at ${song.videoSrc}, then reload.`);
    }
    // Some static servers do not support HEAD; allow the video to try loading.
    if (!response.ok && ![405, 501].includes(response.status)) {
      throw new Error('The video file could not be opened. Check its permissions and restart Live Server.');
    }
    // A poster is optional. Only attach it when a configured local asset exists.
    if (song.posterSrc) {
      const poster = await fetch(song.posterSrc, { method: 'HEAD', signal: requestController.signal }).catch(() => null);
      if (poster?.ok) video.poster = song.posterSrc;
    }
  } catch (error) {
    showError(error.name === 'AbortError'
      ? 'Loading timed out. Check that Live Server is running and the video file is accessible, then reload.'
      : error.message || 'The local video could not load. Check Live Server and reload.');
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
      showError('Video metadata did not load. Check the MP4 format and file, then reload.');
    }, LOAD_TIMEOUT_MS);
    try {
      video.src = song.videoSrc;
      video.load();
    } catch {
      showError('The video could not initialize. Check its path and reload the page.');
    }
  });
}

/** Attaches each media listener once; there are no polling loops or new players. */
function bindVideoEvents() {
  const events = [
    'loadedmetadata', 'durationchange', 'play', 'playing', 'pause', 'waiting',
    'timeupdate', 'seeking', 'seeked', 'ended', 'volumechange', 'error', 'stalled',
  ];
  for (const eventName of events) video.addEventListener(eventName, handleVideoEvent);
}

/**
 * Reads native events, including actions performed through the video's controls.
 * @param {Event} event A media event from the single HTMLVideoElement.
 */
function handleVideoEvent(event) {
  if (event.type === 'error') {
    const errors = {
      1: 'Video loading was interrupted. Reload the page to try again.',
      2: 'The video connection failed. Check Live Server and reload.',
      3: 'The video could not be decoded. Replace the corrupted file with a compatible MP4.',
      4: 'This media format is unsupported. Use an MP4 with H.264 video and AAC audio.',
    };
    showError(errors[video.error?.code] || 'The video is unavailable. Check the file path and MP4 format.');
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
      message = 'Playing · local video';
      clearBufferTimeout();
      break;
    case 'pause':
      playbackState.isActivelyPlaying = false;
      playbackState.buffering = false;
      clearBufferTimeout();
      if (!playbackState.error || playbackState.ready) {
        playbackState.error = null;
        playbackState.status = video.ended ? 'ended' : 'paused';
        message = video.ended ? 'Video ended · press Play to replay' : 'Paused';
      }
      break;
    case 'waiting':
    case 'stalled':
      playbackState.isActivelyPlaying = false;
      if (!video.paused && !playbackState.error) {
        playbackState.status = 'buffering';
        playbackState.buffering = true;
        message = 'Buffering · waiting for video data';
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
      playbackState.buffering = !video.paused && video.readyState < HTMLMediaElement.HAVE_FUTURE_DATA;
      clearBufferTimeout();
      if (!playbackState.error) {
        playbackState.status = video.ended ? 'ended' : video.paused ? 'paused' : playbackState.buffering ? 'buffering' : 'playing';
        message = playbackState.buffering ? 'Buffering · waiting for video data' : video.paused ? 'Paused' : 'Playing · local video';
        if (playbackState.buffering) beginBufferTimeout();
      }
      break;
    case 'timeupdate':
      // Some browsers resume after seeking without another playing event.
      // Actual forward progress confirms recovery; the seek jump alone does not.
      if (playbackState.status === 'playing' && playbackState.currentTime > previousTime
          && !video.paused && !video.seeking && !playbackState.buffering
          && video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
        playbackState.isActivelyPlaying = true;
      }
      break;
    case 'ended':
      playbackState.isActivelyPlaying = false;
      playbackState.status = 'ended';
      playbackState.buffering = false;
      playbackState.seeking = false;
      message = 'Video ended · press Play to replay';
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
    video.volume = Math.min(1, Math.max(0, Number(ui.volume.value) / 100));
    if (video.volume > 0) video.muted = false;
    // volumechange will read the actual result and synchronize the UI.
  });
}

/** Sends play/pause from a user click and handles a rejected play() promise. */
async function togglePlayback() {
  if (!playbackState.ready) return;
  if (!video.paused && !video.ended) {
    video.pause();
    return;
  }
  try {
    await video.play();
  } catch (error) {
    if (error.name === 'AbortError' && video.paused) return;
    if (error.name === 'NotAllowedError') {
      showError('Your browser blocked playback. Press Play in the video or try again.', false);
    } else if (error.name === 'NotSupportedError') {
      showError('This media format is unsupported. Use an MP4 with H.264 video and AAC audio.');
    } else {
      showError('Playback failed. Try the native video controls or reload the page.', false);
    }
  }
}

/** Applies the slider position in seconds; unknown duration keeps seeking disabled. */
function seekFromControl() {
  previewingSeek = false;
  if (!playbackState.ready || playbackState.duration <= 0) return;
  try {
    video.currentTime = Math.min(playbackState.duration, Math.max(0, Number(ui.progress.value)));
    readMediaValues();
    renderControls();
  } catch {
    showError('Seeking is unavailable. Try the progress bar inside the video.', false);
  }
}

/** Reads time, finite duration, volume, mute, and seeking directly from the video. */
function readMediaValues() {
  playbackState.currentTime = Number.isFinite(video.currentTime) ? Math.max(0, video.currentTime) : 0;
  playbackState.duration = Number.isFinite(video.duration) ? Math.max(0, video.duration) : 0;
  playbackState.volume = Math.round(video.volume * 100);
  playbackState.muted = video.muted;
  playbackState.seeking = video.seeking;
}

/** Updates playback controls and notifies components without styling them here. */
function renderControls() {
  const playing = !video.paused && !video.ended && playbackState.ready;
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
    message = 'Video data is taking longer than expected. Check Live Server or reload the page.';
    renderControls();
  }, BUFFER_TIMEOUT_MS);
}

/** Clears the pending buffer warning when playback resumes, pauses, or ends. */
function clearBufferTimeout() {
  clearTimeout(bufferingTimer);
  bufferingTimer = null;
}

/**
 * Reports a media failure below the video without covering it.
 * @param {string} errorMessage A readable explanation and recovery action.
 * @param {boolean} fatal Whether to disable controls (false allows another try).
 */
function showError(errorMessage, fatal = true) {
  playbackState.isActivelyPlaying = false;
  playbackState.status = fatal ? 'error' : video.ended ? 'ended' : video.paused ? 'paused' : 'playing';
  playbackState.error = errorMessage;
  playbackState.buffering = false;
  playbackState.seeking = false;
  if (fatal) playbackState.ready = false;
  previewingSeek = false;
  clearBufferTimeout();
  clearTimeout(loadingTimer);
  message = errorMessage;
  renderControls();
  finishLoading?.();
}

/**
 * Formats actual seconds as M:SS or H:MM:SS; accepts unknown time safely.
 * @param {number} seconds Time in seconds from the video or seek preview.
 * @returns {string} A readable playback clock.
 */
function formatTime(seconds) {
  const total = Number.isFinite(seconds) ? Math.floor(Math.max(0, seconds)) : 0;
  const minutes = Math.floor(total / 60);
  const remainder = String(total % 60).padStart(2, '0');
  if (minutes < 60) return `${minutes}:${remainder}`;
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}:${remainder}`;
}
