/**
 * FILE: catalog.js
 * PURPOSE: Renders the initial catalog artist and three existing song cards.
 * RESPONSIBILITIES: Displays factual metadata, attribution, and honest media or
 * selection placeholders. Adds no selection controls or playback listeners.
 * CONNECTED FILES: main.js calls this before player.js captures the duration node.
 */

import { catalogSource, getArtistById, getArtistTracks } from './data.js';

/**
 * Updates the existing artist section without selecting or loading another song.
 * @param {string} artistId Catalog artist to describe.
 * @param {string} selectedTrackId Only this existing demo receives a duration node.
 */
export function renderArtistCatalog(artistId, selectedTrackId) {
  const artist = getArtistById(artistId);
  document.getElementById('artist-heading').textContent = artist?.name || 'Artist information unavailable';
  document.querySelector('.artist-biography').textContent = artist?.biography || 'Biography pending verification.';
  const tags = Array.isArray(artist?.genres) ? artist.genres : [];
  document.querySelector('.genre-labels').replaceChildren(...tags.map(tag => {
    const item = document.createElement('li');
    item.textContent = tag;
    return item;
  }));
  const source = document.getElementById('catalog-source');
  const link = document.createElement('a');
  link.href = catalogSource.url;
  link.textContent = `${catalogSource.publisher} · ${catalogSource.period}`;
  source.replaceChildren(`No. ${artist?.rank || '—'} · `, link);
  source.title = `${catalogSource.title} · Published ${catalogSource.publishedDate}. ${catalogSource.methodology}`;

  const cards = document.querySelector('.song-cards');
  cards.replaceChildren(...getArtistTracks(artistId).map((track, index) => {
    const selected = track.id === selectedTrackId;
    const pending = track.status === 'pending-selection';
    const card = document.createElement('li');
    card.className = `song-card${selected ? ' is-selected' : ''}`;
    if (selected) card.setAttribute('aria-current', 'true');
    const cover = document.createElement('div');
    cover.className = 'cover-placeholder';
    cover.setAttribute('role', 'img');
    cover.setAttribute('aria-label', pending ? `Unselected song slot ${index + 1}` : `${track.title} artwork unavailable`);
    const placeholder = document.createElement('span');
    placeholder.textContent = 'ARTWORK PENDING';
    cover.append(placeholder);
    // Pending-media paths describe future files; do not make 29 unnecessary requests.
    if (track.status === 'ready-demo' && track.coverArt) {
      const image = document.createElement('img');
      image.alt = '';
      image.hidden = true;
      image.addEventListener('load', () => {
        image.hidden = false;
        placeholder.hidden = true;
        cover.setAttribute('aria-label', `${track.title} cover artwork`);
      }, { once: true });
      image.addEventListener('error', () => image.remove(), { once: true });
      image.src = track.coverArt;
      cover.append(image);
    }
    const details = document.createElement('div');
    details.className = 'song-card-details';
    const title = document.createElement('h4');
    title.textContent = pending ? `Song slot ${index + 1} · selection pending` : track.title;
    const duration = document.createElement('p');
    const clock = document.createElement('span');
    clock.textContent = '--:--';
    if (selected) clock.id = 'selected-song-duration';
    duration.append('Duration: ', clock);
    if (track.featuredArtists?.length) {
      const credit = document.createElement('p');
      credit.textContent = `feat. ${track.featuredArtists.join(', ')}`;
      details.append(title, credit);
    } else details.append(title);
    const availability = document.createElement('span');
    availability.className = selected ? 'selection-label' : 'small-note';
    availability.textContent = selected ? 'Selected · demo' : pending ? 'Pending selection' : 'Media pending · unavailable';
    details.append(duration, availability);
    card.append(cover, details);
    return card;
  }));
  // The unchanged player keeps a duration node even if someone removes the
  // initial catalog entry by mistake; it can then show its normal audio error.
  if (!document.getElementById('selected-song-duration')) {
    const clock = document.createElement('span');
    clock.id = 'selected-song-duration';
    clock.className = 'visually-hidden';
    clock.textContent = '--:--';
    cards.parentElement.append(clock);
  }
}
