/**
 * FILE: search-tests.js
 * PURPOSE: Dependency-free search/filter tests using catalog references and fixtures.
 * RESPONSIBILITIES: Checks matching, Unicode, genres, ordering, and empty metadata.
 * CONNECTED FILES: Import manually in a browser; never initialized by production.
 */

import { artists, tracks } from '../js/data.js';
import { normalizeQuery, deriveGenres, filterCatalog, getTrackGenres } from '../js/search.js';

/** @returns {{passed: number, failed: number, results: object[]}} Test outcomes. */
export function runSearchTests() {
  const results = [];
  const check = (name, passed) => results.push({ name, passed: Boolean(passed) });
  const query = text => filterCatalog({ query: text });
  const genre = selectedGenre => filterCatalog({ selectedGenre });
  const unfiltered = filterCatalog();
  check('10 artists in discovery', unfiltered.artists.length === 10);
  check('All 30 track entries remain discoverable', unfiltered.tracks.length === 30);
  check('Artist name matching', query('Cup of Joe').artists[0]?.id === 'cup-of-joe');
  check('Artist name also finds its tracks', query('Arthur Nery').tracks.length === 3);
  check('Track title matching', query('Multo').tracks[0]?.id === 'cup-of-joe-multo');
  check('Case-insensitive matching', query('mULtO').tracks.length === 1);
  check('Partial artist matching', query('arth').artists[0]?.id === 'arthur-nery');
  check('Partial track matching', query('mister').tracks[0]?.title === 'Misteryoso');
  check('Trim query whitespace', query('  multo  ').tracks.length === 1);
  check('Collapse repeated whitespace', query('cup   of\njoe').artists.length === 1);
  check('Normalization safe for missing strings', normalizeQuery(null) === '' && normalizeQuery(12) === '');
  check('Derive actual genre options', deriveGenres().length === 9 && deriveGenres().includes('Art Rock'));
  check('Do not invent genre options', !deriveGenres().includes('Jazz'));
  check('Genre options contain no duplicates', new Set(deriveGenres().map(normalizeQuery)).size === deriveGenres().length);
  check('Artist own genre filtering', genre('P-Pop').artists.map(a => a.id).join(',') === 'sb19,bini');
  check('Track fallback to artist genres', genre('P-Pop').tracks.length === 6);
  check('Exact genre filtering, not partial Pop', genre('Pop').artists.map(a => a.id).join(',') === 'rob-deniel');
  check('Query searches genre tags', query('indie alternative').artists[0]?.id === 'iv-of-spades');
  check('Query and genre AND logic matches', filterCatalog({ query: 'rob', selectedGenre: 'Pop' }).tracks.length === 3);
  check('Query and incompatible genre AND logic rejects', filterCatalog({ query: 'rob', selectedGenre: 'Rock' }).tracks.length === 0);
  check('No duplicate artist results', new Set(unfiltered.artists.map(a => a.id)).size === 10);
  check('Artist order unchanged', unfiltered.artists.every((a, i) => a === artists[i]));
  check('Track order unchanged', unfiltered.tracks.every((t, i) => t === tracks[i]));
  check('No matches state', query('nothing-matches-this-query').artists.length === 0 && query('nothing-matches-this-query').tracks.length === 0);
  check('Pending selection remains discoverable', query('skusta').tracks.some(t => t.status === 'pending-selection' && t.title === null));
  const fixtureArtists = [
    { id: 'unicode', name: 'Beyoncé', genres: ['Pop'] },
    { id: 'empty', name: null, genres: null },
  ];
  const fixtureTracks = [
    { id: 'own', artistId: 'unicode', title: 'Été', genres: ['Rock'] },
    { id: 'fallback', artistId: 'unicode', title: null, genres: [] },
    { id: 'empty', artistId: 'empty', title: null, genres: null },
  ];
  check('Unicode case and canonical accents', filterCatalog({ query: 'BEYONCE\u0301' }, fixtureArtists, fixtureTracks).artists.length === 1);
  check('Unicode partial title', filterCatalog({ query: 'éT' }, fixtureArtists, fixtureTracks).tracks[0]?.id === 'own');
  check('Track tags override artist tags', getTrackGenres(fixtureTracks[0], fixtureArtists).join(',') === 'Rock');
  check('Track own genre filter', filterCatalog({ selectedGenre: 'Rock' }, fixtureArtists, fixtureTracks).tracks[0]?.id === 'own');
  check('Track empty tags use associated artist tags', getTrackGenres(fixtureTracks[1], fixtureArtists).join(',') === 'Pop');
  check('Missing metadata handled without invented genres', filterCatalog({}, fixtureArtists, fixtureTracks).tracks.length === 3 && getTrackGenres(fixtureTracks[2], fixtureArtists).length === 0);
  check('Empty catalogs return empty results', filterCatalog({}, [], []).artists.length === 0 && deriveGenres([], []).length === 0);
  return { passed: results.filter(r => r.passed).length, failed: results.filter(r => !r.passed).length, results };
}
