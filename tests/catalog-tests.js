/**
 * FILE: catalog-tests.js
 * PURPOSE: Runs meaningful data validation tests in a browser without packages.
 * RESPONSIBILITIES: Checks shipped data and deliberately malformed catalog copies.
 * CONNECTED FILES: Import manually via the browser console; never loaded by main.js.
 */

import { artists, tracks, demoSong, getArtistById, getTrackById, getArtistTracks } from '../js/data.js';
import { validateCatalog } from '../js/catalog-validation.js';

/** @returns {{passed: number, failed: number, results: object[]}} Test outcomes. */
export function runCatalogTests() {
  const results = [];
  function check(name, condition) {
    results.push({ name, passed: Boolean(condition) });
  }
  function rejects(name, mutate, expectedMessage) {
    const artistCopy = structuredClone(artists);
    const trackCopy = structuredClone(tracks);
    mutate(artistCopy, trackCopy);
    const result = validateCatalog(artistCopy, trackCopy);
    check(name, !result.valid && result.errors.some(error => error.includes(expectedMessage)));
  }

  check('Shipped catalog passes validation', validateCatalog().valid);
  check('10 artists, 30 slots, three distinct tracks each', artists.length === 10 && tracks.length === 30
    && artists.every(artist => new Set(artist.trackIds).size === 3));
  check('29 verified titles, one clearly unselected slot', tracks.filter(track => track.title !== null).length === 29
    && tracks.filter(track => track.status === 'pending-selection' && track.title === null).length === 1);
  check('Unknown IDs return safe empty results', getArtistById('missing') === null
    && getTrackById('missing') === null && getArtistTracks('missing').length === 0);
  check('Compatibility adapter preserves supplied paths and all 17 demo lines', demoSong.audioSrc === 'assets/audio/multo.mp3'
    && demoSong.videoSrc === 'assets/videos/multo.mp4' && demoSong.coverArt === 'assets/covers/multo.jpg'
    && demoSong.lyrics.length === 17 && demoSong.lyrics[0].time === 2 && demoSong.lyrics[16].time === 335);
  rejects('Duplicate artist ID', (a) => a[1].id = a[0].id, 'duplicate ID');
  rejects('Duplicate track ID', (a, t) => t[1].id = t[0].id, 'duplicate ID');
  rejects('Unknown artist', (a, t) => t[1].artistId = 'missing', 'unknown artist');
  rejects('Wrong featured count', (a) => a[0].trackIds.pop(), 'exactly three');
  rejects('Missing referenced track', (a) => a[0].trackIds[1] = 'missing', 'missing track');
  rejects('Track owned by another artist', (a) => a[0].trackIds[1] = a[1].trackIds[0], 'belongs to another artist');
  rejects('Repeated reference', (a) => a[0].trackIds[1] = a[0].trackIds[0], 'must be distinct');
  rejects('Unreferenced track', (a, t) => t.push({ ...t[0], id: 'orphan' }), 'exactly one artist');
  rejects('String timestamp', (a, t) => t[0].lyrics[0].time = '2', 'numeric nonnegative');
  rejects('Unsorted timestamps', (a, t) => t[0].lyrics.reverse(), 'timestamps must increase');
  rejects('Infinite timestamp', (a, t) => t[0].lyrics[0].time = Infinity, 'numeric nonnegative');
  rejects('Negative timestamp', (a, t) => t[0].lyrics[0].time = -2, 'numeric nonnegative');
  rejects('Invalid media type', (a, t) => t[1].audioSrc = 12, 'local assets/audio/');
  rejects('Unsafe or wrong media location', (a, t) => t[1].audioSrc = 'assets/audio/../outside.mp3', 'local assets/audio/');
  rejects('Unmarked placeholder', (a, t) => t.find(track => track.status === 'pending-selection').status = 'pending-media', 'needs a title');
  rejects('Placeholder posing as a song', (a, t) => t.find(track => track.status === 'pending-selection').title = 'Invented title', 'null title');
  rejects('Unknown status', (a, t) => t[1].status = 'ready', 'unknown status');
  rejects('Missing source', (a, t) => t[1].sourceUrls = [], 'verification source');
  const minimalArtists = structuredClone(artists);
  const minimalTracks = structuredClone(tracks);
  minimalArtists[1].biography = null;
  minimalArtists[1].genres = [];
  minimalArtists[1].imageSrc = null;
  minimalArtists[1].rank = null;
  minimalTracks[1].audioSrc = null;
  minimalTracks[1].backgroundVideoSrc = null;
  minimalTracks[1].coverArt = null;
  check('Absent optional metadata/media allowed', validateCatalog(minimalArtists, minimalTracks).valid);
  check('Malformed arrays do not throw', !validateCatalog(null, null).valid);
  check('Malformed records do not throw', !validateCatalog([null], [null, []]).valid);
  return {
    passed: results.filter(result => result.passed).length,
    failed: results.filter(result => !result.passed).length,
    results,
  };
}
