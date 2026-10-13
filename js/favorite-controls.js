/**
 * FILE: favorite-controls.js
 * PURPOSE: Keeps every heart button consistent with the single favorites store.
 * RESPONSIBILITIES: Safe labels, filled/outline hearts, pressed state and pending slots.
 * CONNECTED FILES: catalog creates controls; main delegates clicks/subscribes once.
 */

import { getArtistById, getTrackById } from './data.js';
import { canFavoriteTrack, isArtistFavorite, isTrackFavorite } from './favorites.js';

/** Creates a standalone button; never nest it inside a playback button. */
export function createFavoriteControl(type, id) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'icon-button favorite-button favorite-toggle';
  button.dataset.favoriteType = type;
  button.dataset.favoriteId = id;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'icon');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(svg.namespaceURI, 'path');
  path.setAttribute('d', 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z');
  svg.append(path);
  button.append(svg);
  updateFavoriteControl(button);
  return button;
}

/** Updates in place so favoriting never recreates playback controls or loses focus. */
export function updateFavoriteControl(button) {
  const { favoriteType: type, favoriteId: id } = button.dataset;
  const entry = type === 'artist' ? getArtistById(id) : getTrackById(id);
  const enabled = type === 'artist' ? !!entry : canFavoriteTrack(id);
  const favorite = type === 'artist' ? isArtistFavorite(id) : isTrackFavorite(id);
  button.disabled = !enabled;
  button.setAttribute('aria-pressed', String(enabled && favorite));
  button.setAttribute('aria-label', enabled
    ? `${favorite ? 'Remove' : 'Add'} ${type === 'artist' ? entry.name : entry.title} ${favorite ? 'from' : 'to'} favorites`
    : 'Song selection pending - cannot add to favorites');
}

export function updateFavoriteControls() {
  document.querySelectorAll('.favorite-toggle').forEach(updateFavoriteControl);
}
