/**
 * FILE: main.js
 * PURPOSE: Serves as the website's JavaScript ES module entry point.
 * RESPONSIBILITIES: Starts the single-song native video controller.
 * CONNECTED FILES: Loaded by index.html; imports demoSong from data.js and
 * initializePlayer from player.js. Lyrics and vinyl remain static in Step 3.
 */

import { demoSong } from './data.js';
import { initializePlayer } from './player.js';

// Module scripts run after the HTML is parsed. The controller reports failures
// in the page and resolves initialization without creating an unhandled rejection.
initializePlayer(demoSong);
