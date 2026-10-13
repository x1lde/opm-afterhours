/**
 * FILE: search.js
 * PURPOSE: Searches the existing catalog and combines text with one genre filter.
 * RESPONSIBILITIES: Owns only search state, safe rendering, modal/focus interactions.
 * CONNECTED FILES: main.js supplies selection/availability callbacks; data.js owns
 * catalog records; artwork.js handles images. No audio controller or media listeners.
 */

import { artists, tracks } from './data.js';
import { loadArtwork } from './artwork.js';
import { registerOverlay, prepareOverlay, containModalFocus } from './overlays.js';

const searchState = { isOpen: false, query: '', selectedGenre: 'all' };
let initialized = false;
let coordinator;
let dialog;
let opener;
let closeTarget = null;
let renderVersion = 0;
let selectionPending = false;
let sessionVersion = 0;

/** Normalizes canonical Unicode, case and whitespace without discarding letters. */
export function normalizeQuery(value) {
  return typeof value === 'string' ? value.normalize('NFC').trim().replace(/\s+/gu, ' ').toLowerCase() : '';
}

function genreTags(entry) {
  return Array.isArray(entry?.genres) ? entry.genres.filter(tag => typeof tag === 'string' && tag.trim()) : [];
}

/** Track tags take precedence; absent/empty track tags use its artist's stored tags. */
export function getTrackGenres(track, artistEntries = artists) {
  const tags = genreTags(track);
  return tags.length ? tags : genreTags(artistEntries.find(artist => artist?.id === track?.artistId));
}

/** Returns unique catalog-derived display labels; never adds inferred genres. */
export function deriveGenres(artistEntries = artists, trackEntries = tracks) {
  const options = new Map();
  for (const entry of [...artistEntries, ...trackEntries]) {
    for (const tag of genreTags(entry)) {
      const key = normalizeQuery(tag);
      if (!options.has(key)) options.set(key, tag.trim());
    }
  }
  return [...options.values()].sort((a, b) => a.localeCompare(b));
}

/**
 * Pure in-memory filtering, preserving catalog order. Text AND genre must match.
 * Pending slots match their artist/genres but never expose IDs as song titles.
 * @param {object} filters Query and selectedGenre ('all' or a derived label).
 * @param {object[]} artistEntries Optional controlled fixtures for tests.
 * @param {object[]} trackEntries Optional controlled fixtures for tests.
 * @returns {{artists: object[], tracks: object[]}} Matching catalog references.
 */
export function filterCatalog(filters = {}, artistEntries = artists, trackEntries = tracks) {
  const query = normalizeQuery(filters.query);
  const genre = normalizeQuery(filters.selectedGenre || 'all');
  const matches = (text, tags) => (!query || normalizeQuery(text).includes(query))
    && (genre === 'all' || tags.some(tag => normalizeQuery(tag) === genre));
  const seen = new Set();
  const matchingArtists = artistEntries.filter(artist => {
    if (!artist?.id || seen.has(artist.id)) return false;
    seen.add(artist.id);
    const tags = genreTags(artist);
    return matches([artist.name, ...tags].filter(Boolean).join(' '), tags);
  });
  const matchingTracks = trackEntries.filter(track => {
    if (!track?.id) return false;
    const artist = artistEntries.find(entry => entry?.id === track.artistId);
    const tags = getTrackGenres(track, artistEntries);
    return matches([track.title, artist?.name, ...tags].filter(Boolean).join(' '), tags);
  });
  return { artists: matchingArtists, tracks: matchingTracks };
}

/** @returns {object} Copy of search state; no artist/track playback state lives here. */
export function getSearchState() { return { ...searchState }; }
export function isSearchOpen() { return searchState.isOpen; }

/** Initializes once; selection callbacks remain owned by the application coordinator. */
export function initializeSearch(callbacks) {
  if (initialized) return;
  initialized = true;
  coordinator = callbacks;
  dialog = document.getElementById('search-dialog');
  registerOverlay('search', closeSearch);
  const genres = document.getElementById('search-genre');
  for (const genre of deriveGenres()) {
    const option = document.createElement('option');
    option.value = genre;
    option.textContent = genre;
    genres.append(option);
  }
  for (const id of ['desktop-search-toggle', 'mobile-search-toggle']) {
    document.getElementById(id).addEventListener('click', event => openSearch(event.currentTarget));
  }
  document.getElementById('close-search').addEventListener('click', () => closeSearch());
  document.getElementById('catalog-search-form').addEventListener('submit', event => event.preventDefault());
  document.getElementById('catalog-search-query').addEventListener('input', event => {
    searchState.query = event.target.value;
    renderResults();
  });
  genres.addEventListener('change', event => {
    searchState.selectedGenre = event.target.value;
    renderResults();
  });
  document.getElementById('clear-search-query').addEventListener('click', () => {
    setSearchFilters({ query: '' });
    document.getElementById('catalog-search-query').focus();
  });
  document.getElementById('reset-search-genre').addEventListener('click', () => setSearchFilters({ selectedGenre: 'all' }));
  document.getElementById('reset-search').addEventListener('click', () => setSearchFilters({ query: '', selectedGenre: 'all' }));
  dialog.addEventListener('cancel', event => { event.preventDefault(); closeSearch(); });
  dialog.addEventListener('close', () => {
    if (!dialog.open && searchState.isOpen) restoreAfterClose();
  });
  dialog.addEventListener('click', handleResultSelection);
  dialog.addEventListener('keydown', containFocus);
  window.visualViewport?.addEventListener('resize', fitVisualViewport);
}

/** Preserves session filters and uses the native modal's background inertness. */
export function openSearch(trigger = document.getElementById('desktop-search-toggle')) {
  if (searchState.isOpen) return;
  prepareOverlay('search');
  opener = trigger;
  sessionVersion++;
  searchState.isOpen = true;
  document.body.classList.add('search-open');
  document.querySelectorAll('[aria-controls="search-dialog"]').forEach(button => button.setAttribute('aria-expanded', 'true'));
  dialog.showModal();
  fitVisualViewport();
  renderResults();
  document.getElementById('catalog-search-query').focus({ preventScroll: true });
}

/** Closes without touching media; selections may supply a meaningful focus target. */
export function closeSearch(target = null) {
  if (!searchState.isOpen) return;
  closeTarget = target;
  dialog.close();
  // Restore synchronously; a queued native close event must not close a new session.
  restoreAfterClose();
}

function restoreAfterClose() {
  searchState.isOpen = false;
  document.body.classList.remove('search-open');
  document.querySelectorAll('[aria-controls="search-dialog"]').forEach(button => button.setAttribute('aria-expanded', 'false'));
  (closeTarget || opener)?.focus({ preventScroll: true });
  closeTarget = null;
}

/** Changes only filters; provided fields replace state while others are preserved. */
export function setSearchFilters(filters) {
  if ('query' in filters) searchState.query = typeof filters.query === 'string' ? filters.query : '';
  if ('selectedGenre' in filters) searchState.selectedGenre = filters.selectedGenre === 'all'
    || deriveGenres().includes(filters.selectedGenre) ? filters.selectedGenre : 'all';
  document.getElementById('catalog-search-query').value = searchState.query;
  document.getElementById('search-genre').value = searchState.selectedGenre;
  if (searchState.isOpen) renderResults();
}

function fitVisualViewport() {
  if (searchState.isOpen) dialog.style.setProperty('--search-viewport-height', `${window.visualViewport?.height || window.innerHeight}px`);
}

/** Keeps Tab/Shift+Tab inside the modal, including browser chrome boundary cases. */
function containFocus(event) {
  containModalFocus(dialog, event, closeSearch);
}

/** Makes one compact, safe row; missing artwork keeps its textual placeholder. */
function createResult(entry, type, version) {
  const artist = type === 'artist' ? entry : artists.find(item => item.id === entry.artistId);
  const item = document.createElement('li');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'search-result';
  button.dataset.resultType = type;
  button.dataset.resultId = entry.id;
  const imageFrame = document.createElement('span');
  imageFrame.className = 'search-result-artwork';
  const image = document.createElement('img');
  image.alt = '';
  const placeholder = document.createElement('span');
  placeholder.textContent = type === 'artist' ? 'Photo pending' : 'Artwork pending';
  imageFrame.append(image, placeholder);
  const path = type === 'artist' ? entry.imageAvailable ? entry.imageSrc : null
    : ['ready', 'ready-demo'].includes(entry.status) ? entry.coverArt : null;
  loadArtwork(image, path, placeholder);
  const text = document.createElement('span');
  text.className = 'search-result-text';
  const name = document.createElement('strong');
  name.textContent = type === 'artist' ? entry.name || 'Artist information pending'
    : entry.status === 'pending-selection' ? 'Selection pending' : entry.title || 'Title unavailable';
  const details = document.createElement('span');
  details.className = 'small-note';
  details.textContent = type === 'artist' ? genreTags(entry).join(' · ') || 'Genres unavailable' : artist?.name || 'Artist unavailable';
  const status = document.createElement('span');
  status.className = 'small-note search-result-status';
  status.id = `search-${type}-${entry.id}-status`;
  button.setAttribute('aria-describedby', status.id);
  text.append(name, details, status);
  button.append(imageFrame, text);
  item.append(button);
  if (type === 'artist') status.textContent = entry.rank ? `No. ${entry.rank} · First half of 2026` : 'No verified rank';
  else {
    button.disabled = true;
    if (entry.status === 'pending-selection') status.textContent = 'Selection pending · not playable';
    else if (!['ready', 'ready-demo'].includes(entry.status)) status.textContent = 'Audio unavailable';
    else {
      status.textContent = 'Checking audio…';
      coordinator.getAvailability(entry.id).then(available => {
        if (version !== renderVersion || !item.isConnected) return;
        button.disabled = !available;
        status.textContent = available ? 'Available · select to listen' : 'Audio unavailable';
      });
    }
  }
  return item;
}

/** Re-renders search lists only when filters/open state change, never the player. */
function renderResults() {
  const version = ++renderVersion;
  const result = filterCatalog(searchState);
  document.getElementById('search-artists').replaceChildren(...result.artists.map(entry => createResult(entry, 'artist', version)));
  document.getElementById('search-tracks').replaceChildren(...result.tracks.map(entry => createResult(entry, 'track', version)));
  document.getElementById('search-empty').hidden = result.artists.length + result.tracks.length > 0;
  document.getElementById('search-artists-empty').hidden = result.artists.length > 0;
  document.getElementById('search-tracks-empty').hidden = result.tracks.length > 0;
  document.getElementById('search-status').textContent = `${result.artists.length} artists · ${result.tracks.length} track slots`;
  document.getElementById('search-results').scrollTop = 0;
}

/** Delegated selection uses the existing coordinator and closes only on success. */
async function handleResultSelection(event) {
  const button = event.target.closest('button[data-result-id]');
  if (!button || button.disabled || selectionPending) return;
  if (button.dataset.resultType === 'artist') {
    coordinator.selectArtist(button.dataset.resultId);
    closeSearch(document.querySelector('.artist-section'));
    return;
  }
  selectionPending = true;
  const session = sessionVersion;
  button.setAttribute('aria-busy', 'true');
  document.getElementById('search-status').textContent = 'Loading selected track…';
  try {
    const success = await coordinator.selectTrack(button.dataset.resultId);
    if (session !== sessionVersion) return;
    if (success && searchState.isOpen) closeSearch(document.getElementById('play-pause'));
    else if (searchState.isOpen) {
      document.getElementById('search-status').textContent = 'This recording could not play. Your player remains available when search closes.';
      if (!await coordinator.getAvailability(button.dataset.resultId)) {
        button.disabled = true;
        button.querySelector('.search-result-status').textContent = 'Audio unavailable';
      }
    }
  } catch {
    if (session === sessionVersion && searchState.isOpen) document.getElementById('search-status').textContent = 'This recording could not load. Try another available track.';
  } finally {
    selectionPending = false;
    button.removeAttribute('aria-busy');
  }
}
