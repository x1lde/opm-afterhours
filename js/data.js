/**
 * FILE: data.js
 * PURPOSE: Configures the single demonstration song for Step 3.
 * RESPONSIBILITIES: Stores its track ID, title, artist, and local video path.
 * CONNECTED FILES: main.js passes this object to player.js. A full artist
 * catalog and timestamped lyrics will be added in later milestones.
 */

// Add an authorized MP4 at this path. Duration comes from its metadata.
// No coverArt or poster is configured because those assets are not available.
export const demoSong = Object.freeze({
  id: 'cup-of-joe-multo',
  title: 'Multo',
  artist: 'Cup of Joe',
  videoSrc: 'assets/videos/multo.mp4',
});
