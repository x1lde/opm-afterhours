/**
 * FILE: data.js
 * PURPOSE: Configures the single demonstration song for Step 3.
 * RESPONSIBILITIES: Stores track identity, local video path, and supplied cover art.
 * CONNECTED FILES: main.js passes this object to player.js. A full artist
 * catalog and timestamped lyrics will be added in later milestones.
 */

// Add an authorized MP4 at this path. Duration comes from its metadata.
// The developer supplied the local cover; no video poster is configured.
export const demoSong = Object.freeze({
  id: 'cup-of-joe-multo',
  title: 'Multo',
  artist: 'Cup of Joe',
  videoSrc: 'assets/videos/multo.mp4',
  coverArt: 'assets/covers/multo.jpg',
});
