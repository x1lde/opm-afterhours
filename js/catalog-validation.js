/**
 * FILE: catalog-validation.js
 * PURPOSE: Checks catalog data without a dependency or a fatal application error.
 * RESPONSIBILITIES: Validates identity, relationships, paths, statuses, and lyrics.
 * CONNECTED FILES: main.js runs this against data.js; browser tests inject bad data.
 */

import { artists, tracks } from './data.js';

/**
 * Collects all schema errors instead of throwing on the first mistake.
 * Null media paths mean unprovided media; nonempty strings name local files.
 * @param {Array} artistEntries Artist records, defaulting to the shipped catalog.
 * @param {Array} trackEntries Track records, defaulting to the shipped catalog.
 * @returns {{valid: boolean, errors: string[], artistCount: number, trackCount: number}}
 */
export function validateCatalog(artistEntries = artists, trackEntries = tracks) {
  const errors = [];
  if (!Array.isArray(artistEntries)) errors.push('Artists must be an array.');
  if (!Array.isArray(trackEntries)) errors.push('Tracks must be an array.');
  const artistList = Array.isArray(artistEntries) ? artistEntries : [];
  const trackList = Array.isArray(trackEntries) ? trackEntries : [];
  const isText = value => typeof value === 'string' && value.trim().length > 0;
  const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
  const artistIds = new Set();
  const trackIds = new Set();
  const references = new Map();

  function checkId(entry, ids, label) {
    if (!isText(entry.id)) errors.push(`${label}: ID must be a nonempty string.`);
    else if (ids.has(entry.id)) errors.push(`${label}: duplicate ID ${entry.id}.`);
    else ids.add(entry.id);
  }

  function checkPath(value, label, folder, extension) {
    if (value === null) return;
    if (!isText(value) || !value.startsWith(`assets/${folder}/`)
        || value.includes('..') || value.includes('\\') || !extension.test(value)) {
      errors.push(`${label}: expected null or a local assets/${folder}/ path.`);
    }
  }

  function checkGenres(value, label) {
    if (value !== undefined && (!Array.isArray(value) || !value.every(isText))) {
      errors.push(`${label}: genres must be an array of nonempty strings.`);
    }
  }

  function checkSources(value, label) {
    if (!Array.isArray(value) || !value.every(url => isText(url) && /^https:\/\//.test(url))) {
      errors.push(`${label}: sourceUrls must contain HTTPS source links.`);
    }
  }

  for (const [index, artist] of artistList.entries()) {
    if (!isRecord(artist)) {
      errors.push(`Artist ${index}: expected an object.`);
      continue;
    }
    const label = `Artist ${artist.id || index}`;
    checkId(artist, artistIds, label);
    if (!isText(artist.name)) errors.push(`${label}: name is required.`);
    if (artist.biography != null && typeof artist.biography !== 'string') errors.push(`${label}: biography must be text or null.`);
    if (artist.rank != null && (!Number.isInteger(artist.rank) || artist.rank < 1)) errors.push(`${label}: rank must be a positive integer or null.`);
    checkPath(artist.imageSrc, label, 'artists', /\.(jpg|jpeg|png|webp)$/i);
    if (artist.imageAvailable !== undefined && typeof artist.imageAvailable !== 'boolean') errors.push(`${label}: imageAvailable must be a boolean.`);
    checkGenres(artist.genres, label);
    checkSources(artist.sourceUrls, label);
    if (!Array.isArray(artist.trackIds) || artist.trackIds.length !== 3 || !artist.trackIds.every(isText)) {
      errors.push(`${label}: exactly three track IDs are required.`);
    } else if (new Set(artist.trackIds).size !== 3) {
      errors.push(`${label}: featured track IDs must be distinct.`);
    }
  }

  for (const [index, track] of trackList.entries()) {
    if (!isRecord(track)) {
      errors.push(`Track ${index}: expected an object.`);
      continue;
    }
    const label = `Track ${track.id || index}`;
    checkId(track, trackIds, label);
    if (!artistIds.has(track.artistId)) errors.push(`${label}: unknown artist ${track.artistId}.`);
    if (!['ready', 'ready-demo', 'pending-media', 'pending-selection'].includes(track.status)) errors.push(`${label}: unknown status.`);
    if (track.status === 'pending-selection') {
      if (track.title !== null) errors.push(`${label}: pending selection must have a null title.`);
      if (!Array.isArray(track.lyrics) || track.lyrics.length !== 0) errors.push(`${label}: pending selection must have empty lyrics.`);
    } else if (!isText(track.title)) errors.push(`${label}: a selected song needs a title.`);
    checkPath(track.audioSrc, label, 'audio', /\.mp3$/i);
    checkPath(track.backgroundVideoSrc, label, 'videos', /\.mp4$/i);
    checkPath(track.coverArt, label, 'covers', /\.(jpg|jpeg|png|webp)$/i);
    if (['ready', 'ready-demo'].includes(track.status) && !isText(track.audioSrc)) errors.push(`${label}: ready track needs an audio path.`);
    checkGenres(track.genres, label);
    checkSources(track.sourceUrls, label);
    if (track.status !== 'pending-selection' && Array.isArray(track.sourceUrls) && track.sourceUrls.length === 0) errors.push(`${label}: selected song needs a verification source.`);
    if (track.releaseYear != null && (!Number.isInteger(track.releaseYear) || track.releaseYear < 1900)) errors.push(`${label}: invalid release year.`);
    if (!Array.isArray(track.lyrics)) {
      errors.push(`${label}: lyrics must be an array.`);
    } else {
      let previousTime = -1;
      for (const line of track.lyrics) {
        if (!Number.isFinite(line?.time) || line.time < 0 || !isText(line?.text)) {
          errors.push(`${label}: each lyric needs a numeric nonnegative time and text.`);
        } else {
          if (line.time <= previousTime) errors.push(`${label}: lyric timestamps must increase.`);
          previousTime = line.time;
        }
      }
    }
  }

  for (const artist of artistList.filter(isRecord)) {
    if (!Array.isArray(artist.trackIds)) continue;
    for (const id of artist.trackIds) {
      const track = trackList.find(entry => isRecord(entry) && entry.id === id);
      if (!track) errors.push(`Artist ${artist.id}: missing track ${id}.`);
      else if (track.artistId !== artist.id) errors.push(`Artist ${artist.id}: track ${id} belongs to another artist.`);
      references.set(id, (references.get(id) || 0) + 1);
    }
  }
  for (const track of trackList.filter(isRecord)) {
    if (references.get(track.id) !== 1) errors.push(`Track ${track.id}: must be referenced by exactly one artist.`);
  }
  return { valid: errors.length === 0, errors, artistCount: artistList.length, trackCount: trackList.length };
}

/** Logs invalid data for developers while leaving the working player available. */
export function reportCatalogValidation(result) {
  if (!result.valid) console.warn('OPM catalog needs attention:', result.errors);
}
