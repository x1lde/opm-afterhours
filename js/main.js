/**
 * FILE: main.js
 * PURPOSE: Serves as the website's JavaScript ES module entry point.
 * RESPONSIBILITIES: Starts MP3 playback, vinyl/lyrics subscriptions, and an
 * independent muted video controller. Loads the supplied vinyl cover.
 * CONNECTED FILES: Loaded by index.html; imports demoSong from data.js and
 * initializePlayer and subscribeToPlaybackState from player.js. CSS performs
 * rotation and reduced-motion handling; lyrics.js subscribes only to MP3 state.
 * background-video.js controls decorative video independently of player.js.
 */

import { demoSong } from './data.js';
import { initializePlayer, subscribeToPlaybackState } from './player.js';
import { initializeLyrics, loadLyricsForTrack } from './lyrics.js';
import { initializeBackgroundVideo } from './background-video.js';
import { initializeHeader } from './header.js';

initializeHeader();

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
initializeLyrics();
loadLyricsForTrack(demoSong.id, demoSong.lyrics);

// Module scripts run after the HTML is parsed. The controller reports failures
// in the page and resolves initialization without creating an unhandled rejection.
initializePlayer(demoSong);
// These controllers never exchange timestamps, seek positions, or play/pause state.
initializeBackgroundVideo(demoSong);
