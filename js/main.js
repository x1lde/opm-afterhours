/**
 * FILE: main.js
 * PURPOSE: Serves as the website's JavaScript ES module entry point.
 * RESPONSIBILITIES: Starts the player, subscribes vinyl motion to state, and
 * displays the supplied cover with a placeholder fallback.
 * CONNECTED FILES: Loaded by index.html; imports demoSong from data.js and
 * initializePlayer and subscribeToPlaybackState from player.js. CSS performs
 * rotation and reduced-motion handling; lyrics remain static in Step 4.
 */

import { demoSong } from './data.js';
import { initializePlayer, subscribeToPlaybackState } from './player.js';

const vinyl = document.getElementById('vinyl-record');
const vinylArtwork = document.getElementById('vinyl-artwork');
const artworkPlaceholder = document.getElementById('vinyl-artwork-placeholder');

// Reveal only a successfully loaded cover. The placeholder stays available if
// a future cover path is missing; there is never a broken image in the label.
vinylArtwork.addEventListener('load', () => {
  vinylArtwork.hidden = false;
  artworkPlaceholder.hidden = true;
  vinyl.setAttribute('aria-label', `Vinyl record for ${demoSong.title} by ${demoSong.artist} with supplied cover artwork`);
});
vinylArtwork.addEventListener('error', () => {
  vinylArtwork.hidden = true;
  artworkPlaceholder.hidden = false;
  vinyl.setAttribute('aria-label', `Vinyl record for ${demoSong.title} by ${demoSong.artist} with a center artwork placeholder`);
});
if (demoSong.coverArt) vinylArtwork.src = demoSong.coverArt;

/**
 * Updates only vinyl state classes, independent of playback controls.
 * @param {object} state The controller snapshot; isActivelyPlaying confirms motion.
 */
function updateVinylPlayback(state) {
  vinyl.classList.toggle('is-playing', state.isActivelyPlaying);
  vinyl.classList.toggle('is-paused', !state.isActivelyPlaying);
}

// One subscription observes native and custom playback alike. Changing only
// animation-play-state preserves the record's angle instead of restarting it.
subscribeToPlaybackState(updateVinylPlayback);

// Module scripts run after the HTML is parsed. The controller reports failures
// in the page and resolves initialization without creating an unhandled rejection.
initializePlayer(demoSong);
