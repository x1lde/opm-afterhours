/**
 * FILE: search-integration-tests.js
 * PURPOSE: Exercises search UI and actual Multo without packages or mock recordings.
 * RESPONSIBILITIES: Checks resets, selection, focus, navigation guards and playback.
 * CONNECTED FILES: Import manually on a fresh page; not loaded by production.
 */

import { openSearch, closeSearch, getSearchState, setSearchFilters } from '../js/search.js';
import { getApplicationState, selectArtist } from '../js/main.js';
import { getPlaybackState } from '../js/player.js';

async function waitFor(condition) {
  const start = performance.now();
  while (!condition()) {
    if (performance.now() - start > 10000) throw new Error('Search integration timed out.');
    await new Promise(resolve => setTimeout(resolve, 25));
  }
}

/** Runs against supplied Multo, returning outcomes and leaving it paused. */
export async function runSearchIntegrationTests() {
  const results = [];
  const check = (name, passed) => results.push({ name, passed: Boolean(passed) });
  const audio = document.querySelector('audio');
  const video = document.querySelector('video');
  const navigationCount = performance.getEntriesByType('navigation').length;
  await waitFor(() => getPlaybackState().ready);
  selectArtist('cup-of-joe');
  await audio.play();
  await waitFor(() => audio.currentTime > 0.1);
  document.getElementById('header-pull-tab').click();
  const trigger = document.getElementById(window.innerWidth <= 600 ? 'mobile-search-toggle' : 'desktop-search-toggle');
  trigger.click();
  check('Search opens with dialog semantics and input focus', document.querySelector('dialog').matches(':modal') && document.activeElement.id === 'catalog-search-query');
  check('Discovery shows 10 artists and 30 slots', document.querySelectorAll('#search-artists li').length === 10 && document.querySelectorAll('#search-tracks li').length === 30);
  setSearchFilters({ query: 'rob', selectedGenre: 'Pop' });
  check('Combined UI filtering', document.querySelectorAll('#search-artists li').length === 1 && document.querySelectorAll('#search-tracks li').length === 3);
  document.getElementById('clear-search-query').click();
  check('Clear query preserves genre', getSearchState().query === '' && getSearchState().selectedGenre === 'Pop');
  setSearchFilters({ query: 'cup' });
  document.getElementById('reset-search-genre').click();
  check('Reset genre preserves query', getSearchState().query === 'cup' && getSearchState().selectedGenre === 'all');
  document.getElementById('reset-search').click();
  check('Reset all restores discovery', getSearchState().query === '' && getSearchState().selectedGenre === 'all' && document.querySelectorAll('#search-tracks li').length === 30);
  setSearchFilters({ query: 'no-matching-record' });
  check('No results displays helpful state', !document.getElementById('search-empty').hidden);
  setSearchFilters({ query: 'multo' });
  check('Independent section empty state', !document.getElementById('search-artists-empty').hidden && document.getElementById('search-tracks-empty').hidden);
  setSearchFilters({ query: 'skusta' });
  const pending = document.querySelector('[data-result-id="skusta-clee-slot-3"]');
  check('Pending slots disabled without invented titles', pending.disabled && pending.textContent.includes('Selection pending'));
  const oldTrack = getApplicationState().activeTrackId;
  pending.click();
  document.querySelector('[data-result-id="skusta-clee-kalimutan-ka"]').click();
  check('Unavailable result never interrupts audio', !audio.paused && getApplicationState().activeTrackId === oldTrack);
  const oldArtist = getApplicationState().selectedArtistId;
  document.getElementById('next-artist').click();
  check('Background arrows guarded even on synthetic clicks', getApplicationState().selectedArtistId === oldArtist);
  document.querySelector('.artist-section').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
  check('Background keyboard navigation guarded', getApplicationState().selectedArtistId === oldArtist);
  check('Typing/filtering never pauses real media', !audio.paused && audio === document.querySelector('audio') && video === document.querySelector('video'));
  setSearchFilters({ query: 'bini', selectedGenre: 'P-Pop' });
  closeSearch();
  openSearch(trigger);
  check('Session query and genre survive reopening', getSearchState().query === 'bini' && getSearchState().selectedGenre === 'P-Pop');
  setSearchFilters({ query: 'Arthur Nery', selectedGenre: 'all' });
  document.querySelector('[data-result-type="artist"][data-result-id="arthur-nery"]').click();
  check('Artist result selects gallery and closes search', getApplicationState().selectedArtistId === 'arthur-nery' && !document.querySelector('dialog').open);
  check('Artist result preserves active audio', getApplicationState().activeTrackId === oldTrack && !audio.paused);
  check('Artist result returns meaningful focus', document.activeElement === document.querySelector('.artist-section'));
  openSearch(trigger);
  setSearchFilters({ query: 'Multo', selectedGenre: 'all' });
  await waitFor(() => !document.querySelector('[data-result-type="track"][data-result-id="cup-of-joe-multo"]').disabled);
  document.querySelector('[data-result-type="track"][data-result-id="cup-of-joe-multo"]').click();
  await waitFor(() => !document.querySelector('dialog').open);
  check('Available real active-track result uses selection flow', getApplicationState().selectedArtistId === 'cup-of-joe' && getApplicationState().activeTrackId === oldTrack && !audio.paused);
  check('Track result focuses actual playback control', document.activeElement.id === 'play-pause');
  openSearch(trigger);
  setSearchFilters({ query: '', selectedGenre: 'all' });
  document.querySelector('dialog').dispatchEvent(new Event('cancel', { cancelable: true }));
  check('Dialog cancel closes and restores search-trigger focus', !document.querySelector('dialog').open && document.activeElement === trigger);
  document.getElementById('next-artist').click();
  check('Gallery arrows resume after closing', getApplicationState().selectedArtistId === 'arthur-nery');
  selectArtist('cup-of-joe');
  check('No page reload or horizontal overflow', performance.getEntriesByType('navigation').length === navigationCount && document.documentElement.scrollWidth <= innerWidth);
  audio.pause();
  return { passed: results.filter(r => r.passed).length, failed: results.filter(r => !r.passed).length, results };
}
