/**
 * FILE: switching-tests.js
 * PURPOSE: Browser integration checks using the shipped catalog and actual Multo.
 * RESPONSIBILITIES: Verifies browsing never changes playback, unavailable choices
 * are safe, active re-selection is stable, and the responsive DOM remains semantic.
 * CONNECTED FILES: Run manually from a fresh Live Server page; not loaded by main.
 */

import { artists, initialTrackId } from '../js/data.js';
import { selectArtist, selectTrack, getApplicationState } from '../js/main.js';
import { getPlaybackState } from '../js/player.js';

/** Waits for actual browser media/UI conditions; used only by this test harness. */
async function waitFor(condition, timeout = 10000) {
  const start = performance.now();
  while (!condition()) {
    if (performance.now() - start > timeout) throw new Error('Integration test timed out.');
    await new Promise(resolve => setTimeout(resolve, 30));
  }
}

/**
 * Plays the actual supplied Multo briefly, then leaves it paused with Cup of Joe
 * selected. Run on a fresh page before any external mocked track transitions.
 * @returns {Promise<{passed: number, failed: number, results: object[]}>} Outcomes.
 */
export async function runSwitchingTests() {
  const results = [];
  const check = (name, passed) => results.push({ name, passed: Boolean(passed) });
  await waitFor(() => getPlaybackState().ready);
  const audio = document.getElementById('music-audio');
  const navigationCount = performance.getEntriesByType('navigation').length;
  const originalId = getApplicationState().activeTrackId;
  check('Initial track remains Multo, without page-load autoplay', originalId === initialTrackId && audio.paused);
  await audio.play();
  await waitFor(() => audio.currentTime > 0.1);
  document.getElementById('previous-artist').click();
  check('Previous arrow wraps to the final artist', getApplicationState().selectedArtistId === artists.at(-1).id);
  document.getElementById('next-artist').click();
  check('Next arrow wraps back to the first artist', getApplicationState().selectedArtistId === artists[0].id);
  for (const artist of artists) {
    check(`Gallery order includes ${artist.name}`, getApplicationState().selectedArtistId === artist.id);
    document.getElementById('next-artist').click();
  }
  check('Gallery arrows never interrupt playback', !audio.paused && getApplicationState().activeTrackId === originalId);
  for (const artist of artists) {
    selectArtist(artist.id);
    check(`${artist.name}: selects artist and metadata with three slots`,
      getApplicationState().selectedArtistId === artist.id
      && document.getElementById('artist-heading').textContent === artist.name
      && document.querySelector('.artist-biography').textContent === artist.biography
      && document.querySelectorAll('.song-card-button').length === 3);
    check(`${artist.name}: browsing preserves active audio`,
      getApplicationState().activeTrackId === originalId && !audio.paused);
  }
  selectArtist('skusta-clee');
  check('Pending selection is disabled and explicitly labeled',
    document.querySelector('[data-track-id="skusta-clee-slot-3"] button').disabled
    && document.querySelector('[data-track-id="skusta-clee-slot-3"] .card-status').textContent === 'Selection pending');
  await selectTrack('skusta-clee-slot-3');
  await selectTrack('cup-of-joe-tingin');
  check('Pending and unavailable selections preserve playback', !audio.paused && getApplicationState().activeTrackId === originalId);
  const before = audio.currentTime;
  await selectTrack(originalId);
  check('Active re-selection does not restart', audio.currentTime >= before && !audio.paused);
  check('Track selection makes its artist selected', getApplicationState().selectedArtistId === 'cup-of-joe');
  check('Only one audio and one decorative video exist', document.querySelectorAll('audio').length === 1 && document.querySelectorAll('video').length === 1);
  check('Decorative video is silent and hidden from assistive technology', document.querySelector('video').muted && document.querySelector('video').getAttribute('aria-hidden') === 'true');
  check('No horizontal page overflow', document.documentElement.scrollWidth <= window.innerWidth);
  check('No navigation reload', performance.getEntriesByType('navigation').length === navigationCount);
  audio.pause();
  return {
    passed: results.filter(result => result.passed).length,
    failed: results.filter(result => !result.passed).length,
    results,
  };
}
