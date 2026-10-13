/**
 * FILE: main.js
 * PURPOSE: Coordinates artist browsing and track switching using one MP3 controller.
 * RESPONSIBILITIES: Separates the browsed artist from the active listening track;
 * applies committed track metadata, artwork, lyrics and independent video changes.
 * CONNECTED FILES: data/catalog own records/UI; player owns audio; lyrics and video
 * retain their separate responsibilities. Header and responsive layout are preserved.
 */

import { artists, demoSong, initialTrackId, getArtistById, getTrackById, getArtistTracks } from './data.js';
import { initializePlayer, loadTrack, checkTrackAvailability, cancelPendingTrackSelection, getPlaybackState, subscribeToPlaybackState } from './player.js';
import { initializeLyrics, loadLyricsForTrack } from './lyrics.js';
import { initializeBackgroundVideo, setBackgroundTrack } from './background-video.js';
import { initializeHeader } from './header.js';
import { initializeDesktopLayout } from './layout.js';
import { renderArtistNavigation, renderArtistCatalog, updateTrackCards } from './catalog.js';
import { validateCatalog, reportCatalogValidation } from './catalog-validation.js';
import { loadArtwork } from './artwork.js';
import { initializeSearch } from './search.js';
import { isOverlayOpen } from './overlays.js';
import { loadFavorites, subscribeToFavorites, toggleArtistFavorite, toggleTrackFavorite } from './favorites.js';
import { updateFavoriteControls, updateFavoriteControl } from './favorite-controls.js';
import { initializeFavoritesView } from './favorites-view.js';

// Browsing an artist must never replace the song someone is already listening to.
let selectedArtistId = demoSong.artistId;
let activeTrackId = initialTrackId;
let displayedTrackId = null;
let backgroundTrackId = initialTrackId;
let selectionVersion = 0;
const availability = new Map();
const availabilityRequests = new Map();
const feedback = document.getElementById('catalog-feedback');

/** Returns a copy of the two independent selection IDs, for UI and browser tests. */
export function getApplicationState() {
  return { selectedArtistId, activeTrackId };
}

/** Browses catalog information without any audio/video/lyrics load. */
export function selectArtist(artistId) {
  if (!getArtistById(artistId)) return;
  selectedArtistId = artistId;
  feedback.textContent = '';
  renderArtistCatalog(artistId, activeTrackId, availability, getPlaybackState());
  refreshAvailability(artistId);
}

/** Moves only the browsed artist; looping past either end never changes audio. */
function moveArtist(direction) {
  if (isOverlayOpen()) return;
  const index = artists.findIndex(artist => artist.id === selectedArtistId);
  const nextIndex = (index + direction + artists.length) % artists.length;
  selectArtist(artists[nextIndex].id);
}

/** Checks only owner-supplied candidates; pending reservations are not requested. */
async function refreshAvailability(artistId) {
  for (const track of getArtistTracks(artistId)) {
    if (['available', 'unavailable'].includes(availability.get(track.id))) continue;
    if (!['ready-demo', 'ready'].includes(track.status)) {
      availability.set(track.id, 'unavailable');
      continue;
    }
    getCatalogTrackAvailability(track.id).then(() => {
      updateTrackCards(activeTrackId, availability, getPlaybackState());
    });
  }
  updateTrackCards(activeTrackId, availability, getPlaybackState());
}

/** Shares the existing availability cache with search; no competing playback state. */
export async function getCatalogTrackAvailability(trackId) {
  const track = getTrackById(trackId);
  if (!track || !['ready', 'ready-demo'].includes(track.status)) return false;
  if (availability.get(trackId) === 'available') return true;
  if (availability.get(trackId) === 'unavailable') return false;
  if (!availabilityRequests.has(trackId)) {
    availability.set(trackId, 'checking');
    const request = checkTrackAvailability(track).then(available => {
      availability.set(trackId, available ? 'available' : 'unavailable');
      availabilityRequests.delete(trackId);
      return available;
    });
    availabilityRequests.set(trackId, request);
  }
  return availabilityRequests.get(trackId);
}

/**
 * Loads a different verified playable track after user input. The player preflights
 * before commit, so missing audio never replaces a working current track.
 * @param {string} trackId Requested catalog track ID.
 * @returns {Promise<boolean>} Whether this request became the active track.
 */
export async function selectTrack(trackId) {
  const track = getTrackById(trackId);
  const request = ++selectionVersion;
  if (!track || !['ready-demo', 'ready'].includes(track.status)) {
    cancelPendingTrackSelection();
    feedback.textContent = track?.status === 'pending-selection' ? 'This song selection is pending.' : 'Audio unavailable. Your current track continues.';
    return false;
  }
  if (trackId === activeTrackId && getPlaybackState().ready) {
    cancelPendingTrackSelection();
    selectArtist(track.artistId);
    return true;
  }
  feedback.textContent = `Checking audio for ${track.title}...`;
  const song = { ...track, artist: getArtistById(track.artistId)?.name || 'Artist unavailable', videoSrc: track.backgroundVideoSrc };
  const state = await loadTrack(song, { autoplay: true });
  if (request !== selectionVersion) return false;
  if (state.trackId !== trackId) {
    availability.set(trackId, 'unavailable');
    feedback.textContent = 'Audio unavailable. Your current track continues.';
    updateTrackCards(activeTrackId, availability, state);
    return false;
  }
  feedback.textContent = state.error ? 'The selected recording could not play. See the player message.' : '';
  return !state.error;
}

/** Applies listening visuals only when the sole MP3 controller commits a new ID. */
function applyPlaybackState(state) {
  const vinyl = document.getElementById('vinyl-record');
  vinyl.classList.toggle('is-playing', state.isActivelyPlaying);
  vinyl.classList.toggle('is-paused', !state.isActivelyPlaying);
  if (state.trackId && state.trackId !== displayedTrackId) {
    const track = state.selectedSong;
    displayedTrackId = state.trackId;
    activeTrackId = state.trackId;
    const artistChanged = selectedArtistId !== track.artistId;
    selectedArtistId = track.artistId;
    availability.set(track.id, 'available');
    // Keep existing card nodes when their artist hasn't changed, retaining focus
    // and scroll position through the loading/playing transition.
    if (artistChanged) renderArtistCatalog(selectedArtistId, activeTrackId, availability, state);
    refreshAvailability(selectedArtistId);
    document.getElementById('song-heading').textContent = track.title;
    document.getElementById('song-artist').textContent = track.artist;
    const activeFavorite = document.getElementById('active-track-favorite');
    activeFavorite.dataset.favoriteId = track.id;
    updateFavoriteControl(activeFavorite);
    vinyl.setAttribute('aria-label', `Vinyl record for ${track.title} by ${track.artist}`);
    const artwork = document.getElementById('vinyl-artwork');
    artwork.alt = `Cover artwork for ${track.title} by ${track.artist}`;
    loadArtwork(artwork, track.coverArt, document.getElementById('vinyl-artwork-placeholder'));
    loadLyricsForTrack(track.id, track.lyrics);
    document.getElementById('lyrics-note').textContent = track.id === initialTrackId
      ? 'Original demo text - not Multo lyrics' : track.lyrics?.length ? 'Supplied timestamped lyrics' : 'Lyrics unavailable for this track';
    if (track.id !== backgroundTrackId) {
      backgroundTrackId = track.id;
      setBackgroundTrack(track);
    }
  }
  updateTrackCards(activeTrackId, availability, state);
}

loadFavorites();
reportCatalogValidation(validateCatalog());
renderArtistNavigation(selectedArtistId);
renderArtistCatalog(selectedArtistId, activeTrackId, availability);
initializeSearch({ selectArtist, selectTrack, getAvailability: getCatalogTrackAvailability });
initializeFavoritesView({ selectArtist, selectTrack, getAvailability: getCatalogTrackAvailability });
subscribeToFavorites(state => {
  updateFavoriteControls();
  const notice = document.getElementById('favorites-storage-notice');
  if (notice.textContent !== state.message) notice.textContent = state.message;
});
document.addEventListener('click', event => {
  const button = event.target.closest('button.favorite-toggle');
  if (!button || button.disabled) return;
  if (button.dataset.favoriteType === 'artist') toggleArtistFavorite(button.dataset.favoriteId);
  else toggleTrackFavorite(button.dataset.favoriteId);
});
initializeHeader();
initializeDesktopLayout();
initializeLyrics();
loadLyricsForTrack(demoSong.id, demoSong.lyrics);
initializeBackgroundVideo(demoSong);
// One subscription coordinates committed track changes; no second audio controller.
subscribeToPlaybackState(applyPlaybackState);
document.getElementById('previous-artist').addEventListener('click', () => moveArtist(-1));
document.getElementById('next-artist').addEventListener('click', () => moveArtist(1));
document.getElementById('artist-browser').addEventListener('keydown', event => {
  if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
  event.preventDefault();
  moveArtist(event.key === 'ArrowLeft' ? -1 : 1);
});
// Mobile swipes browse artists, never tracks. Vertical gestures and native player
// controls keep their normal behavior; pinch gestures never count as navigation.
const mobileArtists = window.matchMedia('(max-width: 600px)');
const swipeSurface = document.getElementById('main-content');
let swipeStart = null;
swipeSurface.addEventListener('touchstart', event => {
  swipeStart = null;
  if (isOverlayOpen() || !mobileArtists.matches || event.touches.length !== 1
      || event.target.closest('button, input, select, textarea, a')) return;
  const touch = event.touches[0];
  // Leave the browser's screen-edge back/forward gestures available.
  if (touch.clientX < 24 || touch.clientX > window.innerWidth - 24) return;
  swipeStart = { x: touch.clientX, y: touch.clientY, time: performance.now() };
}, { passive: true });
swipeSurface.addEventListener('touchmove', event => {
  if (event.touches.length !== 1) swipeStart = null;
}, { passive: true });
swipeSurface.addEventListener('touchcancel', () => { swipeStart = null; }, { passive: true });
swipeSurface.addEventListener('touchend', event => {
  const start = swipeStart;
  swipeStart = null;
  if (isOverlayOpen() || !start || !mobileArtists.matches || event.changedTouches.length !== 1) return;
  const touch = event.changedTouches[0];
  const dx = touch.clientX - start.x;
  const dy = touch.clientY - start.y;
  if (Math.abs(dx) >= 60 && Math.abs(dx) > Math.abs(dy) * 1.5
      && performance.now() - start.time < 1000) moveArtist(dx < 0 ? 1 : -1);
}, { passive: true });
swipeSurface.addEventListener('keydown', event => {
  if (isOverlayOpen() || !mobileArtists.matches || !['ArrowLeft', 'ArrowRight'].includes(event.key)
      || event.target.closest('button, input, select, textarea, a, #lyrics-scroll')) return;
  event.preventDefault();
  moveArtist(event.key === 'ArrowLeft' ? -1 : 1);
});
mobileArtists.addEventListener('change', () => { swipeStart = null; });
document.querySelector('.song-cards').addEventListener('click', event => {
  const button = event.target.closest('button[data-track-id]');
  if (button && !button.disabled) selectTrack(button.dataset.trackId);
});
initializePlayer(demoSong);
refreshAvailability(selectedArtistId);
