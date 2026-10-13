/**
 * FILE: catalog.js
 * PURPOSE: Renders artist browsing and three semantic featured-track cards.
 * RESPONSIBILITIES: Safe metadata, artwork fallbacks, availability and active states.
 * CONNECTED FILES: main.js owns selection and delegates events; data.js owns records.
 */

import { artists, catalogSource, getArtistById, getArtistTracks } from './data.js';
import { loadArtwork } from './artwork.js';
import { createFavoriteControl, updateFavoriteControl } from './favorite-controls.js';

/** Updates gallery labels in place; arrows wrap in the verified catalog order. */
export function renderArtistNavigation(selectedArtistId) {
  const index = artists.findIndex(artist => artist.id === selectedArtistId);
  if (index < 0) return;
  document.getElementById('artist-browser').dataset.artistId = selectedArtistId;
  const previous = document.getElementById('previous-artist');
  const next = document.getElementById('next-artist');
  previous.disabled = false;
  next.disabled = false;
  previous.setAttribute('aria-label', `Previous artist: ${artists[(index - 1 + artists.length) % artists.length].name}`);
  next.setAttribute('aria-label', `Next artist: ${artists[(index + 1) % artists.length].name}`);
}

/**
 * Artist browsing updates only this section, never the audio or listening metadata.
 * @param {string} artistId Browsed artist ID.
 * @param {string} activeTrackId Independently playing track ID.
 * @param {Map} availability Per-track result: checking, available, or unavailable.
 * @param {object} playback Optional latest playback snapshot for a duration label.
 */
export function renderArtistCatalog(artistId, activeTrackId, availability = new Map(), playback = {}) {
  const artist = getArtistById(artistId);
  renderArtistNavigation(artistId);
  document.getElementById('artist-heading').textContent = artist?.name || 'Artist information unavailable';
  const favorite = document.getElementById('artist-favorite');
  favorite.dataset.favoriteId = artistId;
  updateFavoriteControl(favorite);
  document.querySelector('.artist-biography').textContent = artist?.biography || 'Biography pending verification.';
  document.querySelector('.genre-labels').replaceChildren(...(artist?.genres || []).map(tag => {
    const item = document.createElement('li');
    item.textContent = tag;
    return item;
  }));
  const image = document.getElementById('artist-image');
  image.alt = artist?.name || 'Artist';
  // Existing image paths are reservations. Opt in only when an owner supplies a photo.
  loadArtwork(image, artist?.imageAvailable ? artist.imageSrc : null, document.getElementById('artist-image-placeholder'));
  const source = document.getElementById('catalog-source');
  const link = document.createElement('a');
  link.href = catalogSource.url;
  link.textContent = `${catalogSource.publisher} - ${catalogSource.period}`;
  source.replaceChildren(artist?.rank ? `No. ${artist.rank} - ` : 'Unranked - ', link);
  source.title = `${catalogSource.title} - Published ${catalogSource.publishedDate}. ${catalogSource.methodology}`;

  const cards = document.querySelector('.song-cards');
  cards.replaceChildren(...getArtistTracks(artistId).map((track, index) => {
    const pending = track.status === 'pending-selection';
    const card = document.createElement('li');
    card.className = 'song-card';
    card.dataset.trackId = track.id;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'song-card-button';
    button.dataset.trackId = track.id;
    const titleText = pending ? `Song slot ${index + 1} - selection pending` : track.title;
    button.setAttribute('aria-label', `${titleText} by ${artist.name}`);
    const cover = document.createElement('div');
    cover.className = 'cover-placeholder';
    const placeholder = document.createElement('span');
    placeholder.textContent = 'ARTWORK PENDING';
    const artwork = document.createElement('img');
    artwork.alt = '';
    cover.append(placeholder, artwork);
    loadArtwork(artwork, ['ready-demo', 'ready'].includes(track.status) ? track.coverArt : null, placeholder);
    const details = document.createElement('div');
    details.className = 'song-card-details';
    const title = document.createElement('h4');
    title.textContent = titleText;
    const name = document.createElement('p');
    name.textContent = `${artist.name}${track.featuredArtists?.length ? ' feat. ' + track.featuredArtists.join(', ') : ''}`;
    const duration = document.createElement('p');
    const clock = document.createElement('span');
    clock.className = 'card-duration';
    duration.append('Duration: ', clock);
    const label = document.createElement('span');
    label.className = 'card-status small-note';
    label.id = `${track.id}-availability`;
    button.setAttribute('aria-describedby', label.id);
    details.append(title, name, duration, label);
    button.append(cover, details);
    card.append(button, createFavoriteControl('track', track.id));
    return card;
  }));
  updateTrackCards(activeTrackId, availability, playback);
}

/** Updates states in place so a selected card keeps keyboard focus during loading. */
export function updateTrackCards(activeTrackId, availability, playback = {}) {
  for (const card of document.querySelectorAll('.song-card')) {
    const track = getArtistTracks(document.getElementById('artist-browser').dataset.artistId).find(item => item.id === card.dataset.trackId);
    if (!track) continue;
    const active = track.id === activeTrackId;
    const state = availability.get(track.id);
    const available = state === 'available';
    const button = card.querySelector('.song-card-button');
    button.disabled = !available;
    button.setAttribute('aria-pressed', String(active));
    card.classList.toggle('is-selected', active);
    const label = card.querySelector('.card-status');
    label.textContent = track.status === 'pending-selection' ? 'Selection pending'
      : active && playback.status === 'loading' ? 'Active - loading...'
      : active && playback.error ? 'Active - audio error'
      : active ? 'Active track' : state === 'checking' ? 'Checking audio...'
      : available ? 'Available - select to play' : 'Audio unavailable';
    const clock = card.querySelector('.card-duration');
    if (active) clock.id = 'selected-song-duration';
    else clock.removeAttribute('id');
    clock.textContent = active && playback.duration > 0
      ? `${Math.floor(playback.duration / 60)}:${String(Math.floor(playback.duration % 60)).padStart(2, '0')}` : '--:--';
  }
}
