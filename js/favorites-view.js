/**
 * FILE: favorites-view.js
 * PURPOSE: Displays saved catalog entries in the existing restrained dialog style.
 * RESPONSIBILITIES: Catalog-ordered rows, empty states, removal focus, safe selection.
 * CONNECTED FILES: favorites owns IDs; main supplies existing selection/availability;
 * overlays shares exclusivity and keyboard handling; artwork supplies image fallback.
 */

import { getArtistById } from './data.js';
import { getFavoriteArtists, getFavoriteTracks, getFavoritesState, subscribeToFavorites } from './favorites.js';
import { createFavoriteControl } from './favorite-controls.js';
import { loadArtwork } from './artwork.js';
import { registerOverlay, prepareOverlay, containModalFocus } from './overlays.js';

let dialog;
let coordinator;
let opener;
let initialized = false;
let renderVersion = 0;
let sessionVersion = 0;
let selectionPending = false;

/** Registers one set of modal listeners and one favorites subscription. */
export function initializeFavoritesView(callbacks) {
  if (initialized) return;
  initialized = true;
  coordinator = callbacks;
  dialog = document.getElementById('favorites-dialog');
  registerOverlay('favorites', closeFavorites);
  document.getElementById('favorites-toggle').addEventListener('click', event => openFavorites(event.currentTarget));
  document.getElementById('close-favorites').addEventListener('click', () => closeFavorites());
  dialog.addEventListener('cancel', event => { event.preventDefault(); closeFavorites(); });
  dialog.addEventListener('close', () => {
    if (!dialog.open && document.body.classList.contains('favorites-open')) finishClose();
  });
  dialog.addEventListener('keydown', event => containModalFocus(dialog, event, closeFavorites));
  dialog.addEventListener('click', handleSelection);
  window.visualViewport?.addEventListener('resize', fitViewport);
  subscribeToFavorites(() => { if (dialog.open) renderFavorites(); });
}

/** Opening never changes artist, active track, or media; only one overlay is allowed. */
export function openFavorites(trigger = document.getElementById('favorites-toggle')) {
  if (dialog.open) return;
  prepareOverlay('favorites');
  opener = trigger;
  sessionVersion++;
  document.body.classList.add('favorites-open');
  document.getElementById('favorites-toggle').setAttribute('aria-expanded', 'true');
  dialog.showModal();
  fitViewport();
  renderFavorites();
  document.getElementById('close-favorites').focus({ preventScroll: true });
}

/** Restores invoking-control focus or a meaningful selection target without scrolling. */
export function closeFavorites(target = null) {
  if (!dialog?.open) return;
  dialog.close();
  finishClose(target);
}

function finishClose(target = null) {
  document.body.classList.remove('favorites-open');
  document.getElementById('favorites-toggle').setAttribute('aria-expanded', 'false');
  (target || opener)?.focus({ preventScroll: true });
}

function fitViewport() {
  if (dialog.open) dialog.style.setProperty('--search-viewport-height', `${window.visualViewport?.height || innerHeight}px`);
}

function makeRow(entry, type, version) {
  const item = document.createElement('li');
  item.className = 'favorite-result-row';
  item.dataset.favoriteRow = `${type}:${entry.id}`;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'search-result';
  button.dataset.favoriteResultType = type;
  button.dataset.favoriteResultId = entry.id;
  const frame = document.createElement('span');
  frame.className = 'search-result-artwork';
  const image = document.createElement('img');
  image.alt = '';
  const placeholder = document.createElement('span');
  placeholder.textContent = type === 'artist' ? 'Photo pending' : 'Artwork pending';
  frame.append(image, placeholder);
  loadArtwork(image, type === 'artist' ? entry.imageAvailable ? entry.imageSrc : null
    : ['ready', 'ready-demo'].includes(entry.status) ? entry.coverArt : null, placeholder);
  const text = document.createElement('span');
  text.className = 'search-result-text';
  const title = document.createElement('strong');
  title.textContent = type === 'artist' ? entry.name : entry.title;
  const detail = document.createElement('span');
  detail.className = 'small-note';
  detail.textContent = type === 'artist' ? (entry.genres || []).join(' · ') || 'Genres unavailable'
    : getArtistById(entry.artistId)?.name || 'Artist unavailable';
  const status = document.createElement('span');
  status.className = 'small-note';
  status.id = `favorites-${type}-${entry.id}-availability`;
  button.setAttribute('aria-describedby', status.id);
  text.append(title, detail, status);
  button.append(frame, text);
  const remove = createFavoriteControl(type, entry.id);
  remove.classList.add('favorite-remove');
  item.append(button, remove);
  if (type === 'artist') status.textContent = entry.rank ? `No. ${entry.rank} · First half of 2026` : 'No verified rank';
  else {
    button.disabled = true;
    status.textContent = ['ready', 'ready-demo'].includes(entry.status) ? 'Checking audio…' : 'Audio unavailable';
    coordinator.getAvailability(entry.id).then(available => {
      if (version !== renderVersion || !item.isConnected) return;
      button.disabled = !available;
      status.textContent = available ? 'Available · select to listen' : 'Audio unavailable';
    });
  }
  return item;
}

/** Rebuilds only favorite rows; removal moves focus to a remaining row or Close. */
function renderFavorites() {
  const version = ++renderVersion;
  const oldRows = [...dialog.querySelectorAll('.favorite-result-row')];
  const focusedRow = document.activeElement?.closest('.favorite-result-row');
  const focusIndex = oldRows.indexOf(focusedRow);
  const focusKey = focusedRow?.dataset.favoriteRow;
  const focusedRemove = document.activeElement?.classList.contains('favorite-remove');
  const artistEntries = getFavoriteArtists();
  const trackEntries = getFavoriteTracks();
  document.getElementById('favorite-artists').replaceChildren(...artistEntries.map(entry => makeRow(entry, 'artist', version)));
  document.getElementById('favorite-tracks').replaceChildren(...trackEntries.map(entry => makeRow(entry, 'track', version)));
  document.getElementById('favorites-empty').hidden = artistEntries.length + trackEntries.length > 0;
  document.getElementById('favorite-artists-empty').hidden = artistEntries.length > 0;
  document.getElementById('favorite-tracks-empty').hidden = trackEntries.length > 0;
  document.getElementById('favorites-status').textContent = `${artistEntries.length} favorite artists · ${trackEntries.length} favorite tracks`;
  const notice = document.getElementById('favorites-storage-message');
  const message = getFavoritesState().message;
  if (notice.textContent !== message) notice.textContent = message;
  if (focusIndex >= 0) {
    const rows = [...dialog.querySelectorAll('.favorite-result-row')];
    const next = rows.find(row => row.dataset.favoriteRow === focusKey) || rows[Math.min(focusIndex, rows.length - 1)];
    (next?.querySelector(focusedRemove ? '.favorite-remove' : 'button:not(:disabled)') || document.getElementById('close-favorites')).focus({ preventScroll: true });
  }
}

async function handleSelection(event) {
  const button = event.target.closest('button[data-favorite-result-id]');
  if (!button || button.disabled || selectionPending) return;
  if (button.dataset.favoriteResultType === 'artist') {
    coordinator.selectArtist(button.dataset.favoriteResultId);
    closeFavorites(document.querySelector('.artist-section'));
    return;
  }
  const session = sessionVersion;
  selectionPending = true;
  button.setAttribute('aria-busy', 'true');
  document.getElementById('favorites-status').textContent = 'Loading selected track…';
  try {
    const success = await coordinator.selectTrack(button.dataset.favoriteResultId);
    if (session !== sessionVersion || !dialog.open) return;
    if (success) closeFavorites(document.getElementById('play-pause'));
    else {
      document.getElementById('favorites-status').textContent = 'Audio could not play. You can choose another available track.';
      if (!await coordinator.getAvailability(button.dataset.favoriteResultId)) {
        button.disabled = true;
        document.getElementById(button.getAttribute('aria-describedby')).textContent = 'Audio unavailable';
      }
    }
  } catch {
    if (session === sessionVersion && dialog.open) document.getElementById('favorites-status').textContent = 'Audio could not load. Try another available track.';
  } finally {
    selectionPending = false;
    button.removeAttribute('aria-busy');
  }
}
